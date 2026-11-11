import { inject, injectable } from '@needle-di/core'
import { type BuddyEvent, ClusterEvents, Presence } from '@peck/cluster'
import { type BuddyEntry, BuddyRepository } from '@peck/database'
import { type Player } from '@peck/game'
import { type Logger } from '@peck/logger'
import {
  BuddyChange,
  BuddyRemoveOutgoing,
  BuddyRequestOutgoing,
  BuddyRequestStatus,
  BuddyStatusOutgoing,
} from '@peck/packets'
import { type PacketSession, PluginEvents } from '@peck/plugins'
import { UserVar } from '@peck/shared'

import { SessionManager } from '#emulator/sessions/manager'
import { type Session } from '#emulator/sessions/session'
import { PlayerVariables } from '#emulator/sessions/variables'
import { LoggerToken } from '#emulator/tokens'

/**
 * The presence refresh interval
 */
const REFRESH = 20_000

/**
 * Keeps buddies in step across the cluster
 * @class
 */
@injectable()
export class BuddyService {
  /**
   * Who is playing where
   */
  private readonly presence = inject<Presence>(Presence)

  /**
   * Events between nodes
   */
  private readonly events = inject<ClusterEvents<BuddyEvent>>(ClusterEvents)

  /**
   * The buddies and blocks
   */
  private readonly repository = inject<BuddyRepository>(BuddyRepository)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Raises the player's counters
   */
  private readonly variables = inject<PlayerVariables>(PlayerVariables)

  /**
   * The plugin events
   */
  private readonly plugins = inject<PluginEvents>(PluginEvents)

  /**
   * The logger
   */
  private readonly logger = inject<Logger>(LoggerToken)

  /**
   * This node's id
   */
  private nodeId = 0

  /**
   * The refresh timer
   */
  private timer: ReturnType<typeof setInterval> | null = null

  /**
   * Starts listening
   * @param nodeId This node's id
   */
  public async start(nodeId: number): Promise<void> {
    this.nodeId = nodeId

    await this.events.listen((event) => {
      void this.receive(event).catch((error: unknown) => {
        this.logger.warn({ err: error, type: event.type }, 'buddy event failed')
      })
    })

    this.plugins.on('login', (session) => this.arrive(session))
    this.plugins.on('join', (session) => this.place(session))
    this.plugins.on('logout', (session) => this.leave(session))

    this.timer = setInterval(() => void this.refresh(), REFRESH)
  }

  /**
   * Stops keeping presence fresh
   */
  public stop(): void {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  /**
   * Loads a player's buddies and blocks
   * @param player The player
   */
  public async load(player: Player): Promise<void> {
    const [buddies, blocking, blockedBy] = await Promise.all([
      this.repository.of(player.gameId),
      this.repository.blocking(player.gameId),
      this.repository.blockedBy(player.gameId),
    ])

    for (const buddy of buddies) player.buddies.add(buddy)
    for (const blocked of blocking) player.buddies.block(blocked)
    for (const gameId of blockedBy) player.buddies.blockedBy.add(gameId)
  }

  /**
   * Finds the online buddies
   * @param player The player
   * @returns Their ids
   */
  public async online(player: Player): Promise<Set<number>> {
    const found = await this.presence.many(
      [...player.buddies].map(({ gameId }) => gameId),
    )

    return new Set(found.map(({ gameId }) => gameId))
  }

  /**
   * Tells every node something
   * @param event The event
   */
  public async publish(event: BuddyEvent): Promise<void> {
    await this.events.publish(event)
  }

  /**
   * Describes a player as a buddy
   * @param player The player
   * @returns The entry
   */
  public static entry(player: Player): BuddyEntry {
    return {
      gameId: player.gameId,
      username: player.username,
      uuid: player.uuid,
      accountType: player.accountType,
    }
  }

  /**
   * Sends a player a buddy's status
   * @param session The player's session
   * @param buddy The buddy
   * @param online Whether the buddy is playing
   * @param change Why
   */
  public async tell(
    session: Session,
    buddy: BuddyEntry,
    online: boolean,
    change: BuddyChange,
  ): Promise<void> {
    const avatar = online
      ? this.sessions.byPlayer(buddy.gameId)?.player?.avatar
      : null
    const shown = avatar
      ? { name: avatar.name, perUserId: avatar.perUserId }
      : undefined

    await session.send<BuddyStatusOutgoing>(
      BuddyStatusOutgoing.of(buddy, online, change, shown),
    )
  }

  /**
   * Announces a login
   * @param session The player's session
   */
  private async arrive(session: PacketSession): Promise<void> {
    const { player } = session
    if (!player) return

    await this.place(session)
    if (player.buddies.size > 0) {
      await this.publish({
        type: 'buddy-status',
        buddy: BuddyService.entry(player),
        online: true,
      })
    }
  }

  /**
   * Says where a player is
   * @param session The player's session
   */
  public async place(session: PacketSession): Promise<void> {
    const { player } = session
    if (!player) return

    await this.presence.put({
      gameId: player.gameId,
      username: player.username,
      nodeId: this.nodeId,
      room: player.room?.name ?? null,
      invisible: player.invisible,
    })
  }

  /**
   * Announces a logout
   * @param session The player's session
   */
  private async leave(session: PacketSession): Promise<void> {
    const { player } = session
    if (!player) return

    await this.presence.remove(player.gameId)
    if (player.buddies.size > 0) {
      await this.publish({
        type: 'buddy-status',
        buddy: BuddyService.entry(player),
        online: false,
      })
    }
  }

  /**
   * Refreshes local presence
   */
  private async refresh(): Promise<void> {
    for (const session of this.sessions) {
      if (session.player) await this.place(session)
    }
  }

  /**
   * Handles a cluster event
   * @param event The event
   */
  private async receive(event: BuddyEvent): Promise<void> {
    if (event.type === 'buddy-status') {
      return this.statusChanged(event.buddy, event.online)
    }
    if (event.type === 'player-renamed') {
      return this.renamed(event.gameId, event.from, event.to)
    }

    const session = this.sessions.byPlayer(event.to)
    const player = session?.player
    if (!session || !player) return

    switch (event.type) {
      case 'buddy-request':
        if (player.buddies.has(event.from)) return
        return session.send<BuddyRequestOutgoing>(
          BuddyRequestOutgoing.of(-1, BuddyRequestStatus.Asked, event.from),
        )

      case 'buddy-added':
        player.buddies.add(event.buddy)
        await this.variables.raise(session, UserVar.BuddiesAdded, 1)
        return this.tell(session, event.buddy, true, BuddyChange.Accepted)

      case 'buddy-declined':
        return session.send<BuddyRequestOutgoing>(
          BuddyRequestOutgoing.of(
            -1,
            BuddyRequestStatus.NotTaking,
            event.username,
          ),
        )

      case 'buddy-removed':
        player.buddies.remove(event.username)
        return session.send<BuddyRemoveOutgoing>(
          BuddyRemoveOutgoing.of(-1, event.username),
        )

      case 'block':
        if (event.on) player.buddies.blockedBy.add(event.blockerGameId)
        else player.buddies.blockedBy.delete(event.blockerGameId)
    }
  }

  /**
   * Renames a buddy on every player
   * @param gameId The player renamed
   * @param from Their old username
   * @param to Their new username
   */
  private async renamed(
    gameId: number,
    from: string,
    to: string,
  ): Promise<void> {
    const online = (await this.presence.get(gameId)) !== null

    for (const session of this.sessions) {
      const { player } = session
      if (!player) continue

      if (player.gameId === gameId) {
        await session.close()
        continue
      }

      const buddy = player.buddies.get(from)
      player.buddies.rename(from, to)

      if (buddy) {
        await session.send<BuddyStatusOutgoing>(
          BuddyStatusOutgoing.renamed(buddy, online, to),
        )
      }
    }
  }

  /**
   * Announces a buddy's presence
   * @param buddy The buddy
   * @param online Whether they are playing
   */
  private async statusChanged(
    buddy: BuddyEntry,
    online: boolean,
  ): Promise<void> {
    for (const session of this.sessions) {
      const { player } = session
      if (
        !player ||
        player.gameId === buddy.gameId ||
        !player.buddies.has(buddy.username)
      ) {
        continue
      }

      await this.tell(session, buddy, online, BuddyChange.Update)
    }
  }
}
