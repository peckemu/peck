import { OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The den was emptied
 * @class
 */
@Packet(Outgoing.DenEmpty, 'xt')
export class DenEmptyOutgoing extends OutgoingPacket {
  /**
   * Says the den was emptied
   * @param room The target room
   * @returns The packet
   */
  public static of(room: number): DenEmptyOutgoing {
    return PacketFactory.create<DenEmptyOutgoing>(DenEmptyOutgoing, { room })
  }
}
