import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether a mute worked
 * @class
 */
@Packet(Outgoing.Mute, 'xt')
export class MuteOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.bool() public readonly success: boolean = false

  /**
   * Says the mute worked
   * @param room The target room
   * @returns The packet
   */
  public static done(room: number): MuteOutgoing {
    return PacketFactory.create<MuteOutgoing>(MuteOutgoing, {
      room,
      success: true,
    })
  }

  /**
   * Says the mute failed
   * @param room The target room
   * @returns The packet
   */
  public static refused(room: number): MuteOutgoing {
    return PacketFactory.create<MuteOutgoing>(MuteOutgoing, {
      room,
      success: false,
    })
  }
}
