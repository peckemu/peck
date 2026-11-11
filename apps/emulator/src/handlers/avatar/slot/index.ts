import { AvatarSlotIncoming, AvatarSlotOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Buys another animal slot
 * @class
 */
@Handler(AvatarSlotIncoming)
export class AvatarSlotHandler extends PacketHandler<AvatarSlotIncoming> {
  /**
   * Opens the slot
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: AvatarSlotIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    if (!player.member) {
      context.log.info({ refusal: 'not a member' }, 'animal slot refused')
      return session.send<AvatarSlotOutgoing>(
        AvatarSlotOutgoing.refused(packet.room),
      )
    }

    await session.send<AvatarSlotOutgoing>(
      AvatarSlotOutgoing.bought(packet.room),
    )
  }
}
