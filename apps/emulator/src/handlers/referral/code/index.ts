import { ReferralCodeIncoming, ReferralCodeOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Sends the referral code
 * @class
 */
@Throttle({ limit: 5, per: 10_000 })
@Handler(ReferralCodeIncoming)
export class ReferralCodeHandler extends PacketHandler<ReferralCodeIncoming> {
  /**
   * Sends the player's code
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: ReferralCodeIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    await session.send<ReferralCodeOutgoing>(
      ReferralCodeOutgoing.of(packet.room, player.uuid),
    )
  }
}
