import { inject, injectable } from '@needle-di/core'
import {
  ClusterEvents,
  type JamagramEvent,
  type ModerationEvent,
  type StaffEvent,
} from '@peck/cluster'
import {
  AuditRepository,
  JamagramRepository,
  ModerationRepository,
  PlayerRepository,
  type ReportInfo,
  type SanctionInfo,
} from '@peck/database'

import { ServiceError } from '#api/errors'

/**
 * Lets staff review reports and lift sanctions
 * @class
 */
@injectable()
export class ModerationService {
  /**
   * Keeps reports, bans and mutes
   */
  private readonly moderation =
    inject<ModerationRepository>(ModerationRepository)

  /**
   * Events to the nodes
   */
  private readonly events =
    inject<ClusterEvents<ModerationEvent | StaffEvent | JamagramEvent>>(
      ClusterEvents,
    )

  /**
   * Keeps Jam-a-Grams
   */
  private readonly jamagrams = inject<JamagramRepository>(JamagramRepository)

  /**
   * Finds players
   */
  private readonly players = inject<PlayerRepository>(PlayerRepository)

  /**
   * The audit log
   */
  private readonly audit = inject<AuditRepository>(AuditRepository)

  /**
   * Lists the open reports
   * @returns The reports
   */
  public async reports(): Promise<ReportInfo[]> {
    return this.moderation.reports()
  }

  /**
   * Resolves a report
   * @param actorId The staff account
   * @param id The report
   */
  public async resolve(actorId: string, id: string): Promise<void> {
    if (!(await this.moderation.resolve(id, actorId))) {
      throw new ServiceError('Report is not open', 'NOT_FOUND')
    }
  }

  /**
   * Lists the running bans and mutes
   * @returns The sanctions
   */
  public async sanctions(): Promise<SanctionInfo[]> {
    return this.moderation.sanctions()
  }

  /**
   * Lifts a ban or mute
   * @param actorId The staff account
   * @param id The sanction
   */
  public async lift(actorId: string, id: string): Promise<void> {
    const sanction = await this.moderation.liftById(id, actorId)
    if (!sanction) {
      throw new ServiceError('Sanction is not running', 'NOT_FOUND')
    }

    if (sanction.kind !== 'mute') return

    const mute = await this.moderation.active(sanction.accountId, 'mute')
    if (mute) {
      await this.events.publish({
        type: 'player-muted',
        accountId: sanction.accountId,
        until: mute.expiresAt?.getTime() ?? null,
      })
      return
    }

    await this.events.publish({
      type: 'player-unmuted',
      accountId: sanction.accountId,
    })
  }

  /**
   * Shows a message to every player
   * @param actorId The staff account
   * @param text The message
   * @param system Whether it is a system message
   */
  public async broadcast(
    actorId: string,
    text: string,
    system: boolean,
  ): Promise<void> {
    await this.events.publish({ type: 'staff-broadcast', text, system })

    await this.audit.record({
      actorId,
      action: 'server.broadcast',
      targetKind: 'server',
      targetId: 'all',
      targetName: '',
      detail: { text, system },
    })
  }

  /**
   * Ends a player's hosted party
   * @param actorId The staff account
   * @param hostGameId The host's game id
   */
  public async endParty(actorId: string, hostGameId: number): Promise<void> {
    const name = await this.players.nameOf(hostGameId)
    if (name === null) throw new ServiceError('Player not found', 'NOT_FOUND')

    await this.events.publish({ type: 'party-ended', hostGameId })

    await this.audit.record({
      actorId,
      action: 'party.ended',
      targetKind: 'player',
      targetId: String(hostGameId),
      targetName: name,
    })
  }

  /**
   * Changes a Jam-a-Gram's message
   * @param actorId The staff account
   * @param id The card
   * @param message Its new message
   */
  public async redact(
    actorId: string,
    id: number,
    message: string,
  ): Promise<void> {
    const card = await this.jamagrams.redact(id, message)
    if (!card) throw new ServiceError('Jam-a-Gram not found', 'NOT_FOUND')

    await this.events.publish({
      type: 'jamagram-updated',
      to: card.toGameId,
      id,
      message,
    })

    await this.audit.record({
      actorId,
      action: 'jamagram.redacted',
      targetKind: 'player',
      targetId: String(card.fromGameId ?? 0),
      targetName: card.senderName,
      detail: { jamagramId: id, was: card.was, message },
    })
  }
}
