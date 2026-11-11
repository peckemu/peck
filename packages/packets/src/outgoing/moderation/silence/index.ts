import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether a silence worked
 * @class
 */
@Packet(Outgoing.Silence, 'xt')
export class SilenceOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.bool() public readonly success: boolean = false

  /**
   * Says the silence worked
   * @param room The target room
   * @returns The packet
   */
  public static done(room: number): SilenceOutgoing {
    return PacketFactory.create<SilenceOutgoing>(SilenceOutgoing, {
      room,
      success: true,
    })
  }

  /**
   * Says the silence failed
   * @param room The target room
   * @returns The packet
   */
  public static refused(room: number): SilenceOutgoing {
    return PacketFactory.create<SilenceOutgoing>(SilenceOutgoing, {
      room,
      success: false,
    })
  }
}
