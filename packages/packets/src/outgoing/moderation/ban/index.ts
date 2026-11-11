import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether a ban worked
 * @class
 */
@Packet(Outgoing.Ban, 'xt')
export class BanOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.bool() public readonly success: boolean = false

  /**
   * Says the ban worked
   * @param room The target room
   * @returns The packet
   */
  public static done(room: number): BanOutgoing {
    return PacketFactory.create<BanOutgoing>(BanOutgoing, {
      room,
      success: true,
    })
  }

  /**
   * Says the ban failed
   * @param room The target room
   * @returns The packet
   */
  public static refused(room: number): BanOutgoing {
    return PacketFactory.create<BanOutgoing>(BanOutgoing, {
      room,
      success: false,
    })
  }
}
