import { OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A minigame's room is empty
 * @class
 */
@Packet(Outgoing.MinigameEmpty, 'xt')
export class MinigameEmptyOutgoing extends OutgoingPacket {
  /**
   * Says the room is empty
   * @param room The game's room
   * @returns The packet
   */
  public static of(room: number): MinigameEmptyOutgoing {
    return PacketFactory.create<MinigameEmptyOutgoing>(MinigameEmptyOutgoing, {
      room,
    })
  }
}
