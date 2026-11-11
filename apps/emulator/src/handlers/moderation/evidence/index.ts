import { inject } from '@needle-di/core'
import { ModerationRepository } from '@peck/database'
import { type Player } from '@peck/game'
import { ReportEvidenceIncoming, ReportEvidenceOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import {
  type ModerationTarget,
  ModerationTools,
} from '#emulator/handlers/moderation/tools'

/**
 * The longest data
 */
const LONGEST = 64

/**
 * Reports a player with evidence
 * @class
 */
@Throttle({ limit: 5, per: 60_000 })
@Handler(ReportEvidenceIncoming)
export class ReportEvidenceHandler extends PacketHandler<ReportEvidenceIncoming> {
  /**
   * Keeps reports
   */
  private readonly moderation =
    inject<ModerationRepository>(ModerationRepository)

  /**
   * Finds players
   */
  private readonly tools = inject<ModerationTools>(ModerationTools)

  /**
   * Keeps the report
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: ReportEvidenceIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const reported = await this.tools.find(packet.userName)
    const refusal = this.refusal(packet, player, reported)
    if (refusal !== null || !reported) {
      context.log.info({ refusal }, 'report refused')
      return session.send<ReportEvidenceOutgoing>(
        ReportEvidenceOutgoing.refused(packet.room),
      )
    }

    await this.moderation.report({
      reporterGameId: player.gameId,
      reportedGameId: reported.gameId,
      reasonId: packet.reasonId,
      dataType: packet.dataType,
      data: packet.data,
      roomName: player.room?.name ?? '',
    })

    await session.send<ReportEvidenceOutgoing>(
      ReportEvidenceOutgoing.done(packet.room),
    )
  }

  /**
   * Finds why a report can't be kept
   * @param packet The packet
   * @param player The player reporting
   * @param reported The player reported
   * @returns The reason, or null
   */
  private refusal(
    packet: ReportEvidenceIncoming,
    player: Player,
    reported: ModerationTarget | null,
  ): string | null {
    if (!reported) return 'no such player'
    if (reported.gameId === player.gameId) return 'own player'
    if (packet.data.length > LONGEST) return 'data too long'

    return null
  }
}
