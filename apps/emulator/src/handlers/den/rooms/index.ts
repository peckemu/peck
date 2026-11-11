import { DenRoomsIncoming, DenRoomsOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Lists the player's den rooms
 * @class
 */
@Handler(DenRoomsIncoming)
export class DenRoomsHandler extends PacketHandler<DenRoomsIncoming> {
  /**
   * Sends the den rooms
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DenRoomsIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    await session.send<DenRoomsOutgoing>(
      DenRoomsOutgoing.of(packet.room, player.denRooms),
    )
  }
}
