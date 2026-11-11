import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether the kept animals were taken
 * @class
 */
@Packet(Outgoing.AvatarOrdain, 'xt')
export class AvatarOrdainOutgoing extends OutgoingPacket {
  /**
   * Whether they were
   */
  @Field.int() public readonly success: number = 0

  /**
   * Says the animals were taken
   * @param room The room
   * @returns The packet
   */
  public static chosen(room: number): AvatarOrdainOutgoing {
    return PacketFactory.create<AvatarOrdainOutgoing>(AvatarOrdainOutgoing, {
      room,
      success: 1,
    })
  }

  /**
   * Says they weren't
   * @param room The room
   * @returns The packet
   */
  public static refused(room: number): AvatarOrdainOutgoing {
    return PacketFactory.create<AvatarOrdainOutgoing>(AvatarOrdainOutgoing, {
      room,
      success: 0,
    })
  }
}
