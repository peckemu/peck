import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether the first animal was made
 * @class
 */
@Packet(Outgoing.AvatarFastPass, 'xt')
export class AvatarFastPassOutgoing extends OutgoingPacket {
  /**
   * Whether it was made
   */
  @Field.int() public readonly success: number = 0

  /**
   * Says the first animal was made
   * @param room The target room
   * @returns The packet
   */
  public static success(room: number): AvatarFastPassOutgoing {
    return PacketFactory.create<AvatarFastPassOutgoing>(
      AvatarFastPassOutgoing,
      {
        room,
        success: 1,
      },
    )
  }

  /**
   * Says the first animal was refused
   * @param room The target room
   * @returns The packet
   */
  public static failure(room: number): AvatarFastPassOutgoing {
    return PacketFactory.create<AvatarFastPassOutgoing>(
      AvatarFastPassOutgoing,
      {
        room,
        success: 0,
      },
    )
  }
}
