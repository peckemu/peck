import { OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The player was sent out of a den
 * @class
 */
@Packet(Outgoing.DenKicked, 'xt')
export class DenKickedOutgoing extends OutgoingPacket {
  /**
   * Says the player was sent out
   * @returns The packet
   */
  public static of(): DenKickedOutgoing {
    return PacketFactory.create<DenKickedOutgoing>(DenKickedOutgoing, {
      room: -1,
    })
  }
}
