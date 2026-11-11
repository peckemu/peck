import { inject, injectable } from '@needle-di/core'
import { ClusterEvents, type ModerationEvent, Presence } from '@peck/cluster'
import {
  AccessRepository,
  AuditRepository,
  ModerationRepository,
  PlayerRepository,
} from '@peck/database'
import { ModerationRules, type Player } from '@peck/game'
import { type Logger } from '@peck/logger'
import { ModerationNoticeOutgoing } from '@peck/packets'
import { can } from '@peck/permissions'

import { type Session } from '#emulator/sessions/session'
import { SessionManager } from '#emulator/sessions/manager'
import { LoggerToken } from '#emulator/tokens'

/**
 * The staff action events
 */
const ACTIONS: ReadonlySet<string> = new Set([
  'player-banned',
  'player-muted',
  'player-unmuted',
  'player-kicked',
])

/**
 * A player staff act on
 */
export type ModerationTarget = {
  /**
   * Their id in the database
   */
  readonly gameId: number

  /**
   * Their username
   */
  readonly username: string

  /**
   * Their account
   */
  readonly accountId: string
}

/**
 * Lets staff ban, mute and kick players
 * @class
 */
@injectable()
export class ModerationTools {
  /**
   * Who may do what
   */
  private readonly access = inject<AccessRepository>(AccessRepository)

  /**
   * Keeps bans and mutes
   */
  private readonly moderation =
    inject<ModerationRepository>(ModerationRepository)

  /**
   * The audit log
   */
  private readonly audit = inject<AuditRepository>(AuditRepository)

  /**
   * The players
   */
  private readonly players = inject<PlayerRepository>(PlayerRepository)

  /**
   * Who is playing
   */
  private readonly presence = inject<Presence>(Presence)

  /**
   * Events between nodes
   */
  private readonly events =
    inject<ClusterEvents<ModerationEvent>>(ClusterEvents)

  /**
   * The sessions
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * The logger
   */
  private readonly logger = inject<Logger>(LoggerToken)

  /**
   * Starts listening for staff actions
   */
  public async start(): Promise<void> {
    await this.events.listen((event) => {
      if (!ACTIONS.has(event.type)) return

      void this.apply(event).catch((error: unknown) => {
        this.logger.warn(
          { err: error, type: event.type },
          'moderation event failed',
        )
      })
    })
  }

  /**
   * Checks a player may moderate
   * @param player The player
   * @returns Whether they may
   */
  public async allowed(player: Player): Promise<boolean> {
    const actor = await this.access.actorOf(player.accountId)

    return can(actor, 'players.moderate')
  }

  /**
   * Finds a player by name
   * @param username Their username
   * @returns The player, or null
   */
  public async find(username: string): Promise<ModerationTarget | null> {
    const found = await this.players.named(username)
    if (!found) return null

    return {
      gameId: found.gameId,
      username: found.username,
      accountId: found.accountId,
    }
  }

  /**
   * Finds why staff can't act on a player
   * @param staff The staff player
   * @param target The player, or null
   * @returns The reason, or null
   */
  public async refusal(
    staff: Player,
    target: ModerationTarget | null,
  ): Promise<string | null> {
    const actor = await this.access.actorOf(staff.accountId)
    if (!can(actor, 'players.moderate')) return 'not staff'
    if (!target) return 'no such player'
    if (target.accountId === staff.accountId) return 'own account'

    const other = await this.access.actorOf(target.accountId)
    if (can(other, 'players.moderate') && other.rank >= actor.rank) {
      return 'staff outranks'
    }

    return null
  }

  /**
   * Bans a player
   * @param staff The staff player
   * @param target The player
   * @param hours How long, or 0
   * @param reasonId The rule broken
   * @param note The staff note
   */
  public async ban(
    staff: Player,
    target: ModerationTarget,
    hours: number,
    reasonId: number,
    note: string,
  ): Promise<void> {
    const expiresAt = ModerationRules.banEnds(hours)

    await this.moderation.sanction({
      actorId: staff.accountId,
      accountId: target.accountId,
      gameId: target.gameId,
      username: target.username,
      kind: 'ban',
      reasonId,
      note,
      expiresAt,
    })

    await this.events.publish({
      type: 'player-banned',
      accountId: target.accountId,
      until: expiresAt?.getTime() ?? null,
    })
  }

  /**
   * Mutes a player or lifts it
   * @param staff The staff player
   * @param target The player
   * @param minutes How long, or 0
   * @param reasonId The rule broken
   * @param note The staff note
   * @returns Whether it worked
   */
  public async mute(
    staff: Player,
    target: ModerationTarget,
    minutes: number,
    reasonId: number,
    note: string,
  ): Promise<boolean> {
    if (minutes === 0) {
      const lifted = await this.moderation.lift(
        target.accountId,
        'mute',
        staff.accountId,
      )
      if (lifted === 0) return false

      await this.events.publish({
        type: 'player-unmuted',
        accountId: target.accountId,
      })

      return true
    }

    const expiresAt = ModerationRules.muteEnds(minutes)

    await this.moderation.sanction({
      actorId: staff.accountId,
      accountId: target.accountId,
      gameId: target.gameId,
      username: target.username,
      kind: 'mute',
      reasonId,
      note,
      expiresAt,
    })

    await this.events.publish({
      type: 'player-muted',
      accountId: target.accountId,
      until: expiresAt?.getTime() ?? null,
    })

    return true
  }

  /**
   * Kicks a player
   * @param staff The staff player
   * @param target The player
   * @param note The staff note
   * @returns Whether they were playing
   */
  public async kick(
    staff: Player,
    target: ModerationTarget,
    note: string,
  ): Promise<boolean> {
    const playing =
      this.sessions.byPlayer(target.gameId) !== null ||
      (await this.presence.get(target.gameId)) !== null
    if (!playing) return false

    await this.audit.record({
      actorId: staff.accountId,
      action: 'player.kicked',
      targetKind: 'player',
      targetId: String(target.gameId),
      targetName: target.username,
      detail: { note },
    })

    await this.events.publish({ type: 'player-kicked', gameId: target.gameId })

    return true
  }

  /**
   * Records staff going unseen or seen
   * @param staff The staff player
   */
  public async hidden(staff: Player): Promise<void> {
    await this.audit.record({
      actorId: staff.accountId,
      action: 'player.invisible',
      targetKind: 'player',
      targetId: String(staff.gameId),
      targetName: staff.username,
      detail: { invisible: staff.invisible },
    })
  }

  /**
   * Acts on a staff action
   * @param event The action
   */
  private async apply(event: ModerationEvent): Promise<void> {
    if (event.type === 'player-kicked') {
      const session = this.sessions.byPlayer(event.gameId)
      if (!session) return

      await session.send<ModerationNoticeOutgoing>(
        ModerationNoticeOutgoing.kicked(ModerationTools.roomOf(session)),
      )
      return session.close()
    }

    for (const session of this.sessions.byAccount(event.accountId)) {
      await this.tell(session, event)
    }
  }

  /**
   * Tells a player of a staff action
   * @param session The player's session
   * @param event The action
   */
  private async tell(session: Session, event: ModerationEvent): Promise<void> {
    const { player } = session
    if (!player) return

    const room = ModerationTools.roomOf(session)

    switch (event.type) {
      case 'player-banned':
        await session.send<ModerationNoticeOutgoing>(
          ModerationNoticeOutgoing.banned(
            room,
            ModerationRules.secondsLeft(event.until),
          ),
        )
        return session.close()
      case 'player-muted':
        player.mutedUntil = event.until ?? Infinity
        return session.send<ModerationNoticeOutgoing>(
          ModerationNoticeOutgoing.silenced(
            room,
            ModerationRules.minutesLeft(event.until),
          ),
        )
      case 'player-unmuted':
        player.mutedUntil = 0
        return session.send<ModerationNoticeOutgoing>(
          ModerationNoticeOutgoing.unsilenced(room),
        )
      case 'player-kicked':
        return
    }
  }

  /**
   * Finds a player's room
   * @param session The player's session
   * @returns The room, or -1
   */
  private static roomOf(session: Session): number {
    return session.player?.roomId ?? -1
  }
}
