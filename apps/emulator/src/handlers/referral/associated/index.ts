import { inject } from '@needle-di/core'
import { ReferralRepository } from '@peck/database'
import {
  ReferralAssociatedIncoming,
  ReferralAssociatedOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '../../../dispatch/context/index.ts'

/**
 * Says whether the player has a referrer
 * @class
 */
@Throttle({ limit: 5, per: 10_000 })
@Handler(ReferralAssociatedIncoming)
export class ReferralAssociatedHandler extends PacketHandler<ReferralAssociatedIncoming> {
  /**
   * Keeps who referred whom
   */
  private readonly referrals = inject<ReferralRepository>(ReferralRepository)

  /**
   * Looks up the player's referrer
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: ReferralAssociatedIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const referrer = await this.referrals.referrerOf(player.gameId)

    await session.send<ReferralAssociatedOutgoing>(
      ReferralAssociatedOutgoing.of(packet.room, referrer !== null),
    )
  }
}
