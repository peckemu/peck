import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether an animal was removed
 * @class
 */
@Packet(Outgoing.AvatarRemove, 'xt')
export class AvatarRemoveOutgoing extends OutgoingPacket {
  /**
   * Whether it was
   */
  @Field.int() public readonly success: number = 0

  /**
   * The player's gems now
   */
  @Field.int() public readonly gems: number = 0

  /**
   * Says the animal was removed
   * @param room The room
   * @param gems The player's gems now
   * @returns The packet
   */
  public static removed(room: number, gems: number): AvatarRemoveOutgoing {
    return PacketFactory.create<AvatarRemoveOutgoing>(AvatarRemoveOutgoing, {
      room,
      success: 1,
      gems,
    })
  }

  /**
   * Says it wasn't
   * @param room The room
   * @param gems The player's gems
   * @returns The packet
   */
  public static refused(room: number, gems: number): AvatarRemoveOutgoing {
    return PacketFactory.create<AvatarRemoveOutgoing>(AvatarRemoveOutgoing, {
      room,
      success: 0,
      gems,
    })
  }
}
