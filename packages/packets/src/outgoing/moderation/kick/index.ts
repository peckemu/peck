import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether a kick worked
 * @class
 */
@Packet(Outgoing.Kick, 'xt')
export class KickOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.bool() public readonly success: boolean = false

  /**
   * Says the kick worked
   * @param room The target room
   * @returns The packet
   */
  public static done(room: number): KickOutgoing {
    return PacketFactory.create<KickOutgoing>(KickOutgoing, {
      room,
      success: true,
    })
  }

  /**
   * Says the kick failed
   * @param room The target room
   * @returns The packet
   */
  public static refused(room: number): KickOutgoing {
    return PacketFactory.create<KickOutgoing>(KickOutgoing, {
      room,
      success: false,
    })
  }
}
