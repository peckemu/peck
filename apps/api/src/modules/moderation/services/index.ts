import { inject, injectable } from '@needle-di/core'
import { ClusterEvents, type ModerationEvent } from '@peck/cluster'
import {
  ModerationRepository,
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
    inject<ClusterEvents<ModerationEvent>>(ClusterEvents)

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
}
