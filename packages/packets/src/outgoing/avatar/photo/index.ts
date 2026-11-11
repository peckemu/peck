import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The gems left
 * @class
 */
@Packet(Outgoing.AvatarPhoto, 'xt')
export class AvatarPhotoOutgoing extends OutgoingPacket {
  /**
   * The player's gems now
   */
  @Field.int() public readonly gems: number = 0

  /**
   * Says what the player has left
   * @param room The room
   * @param gems The player's gems now
   * @returns The packet
   */
  public static of(room: number, gems: number): AvatarPhotoOutgoing {
    return PacketFactory.create<AvatarPhotoOutgoing>(AvatarPhotoOutgoing, {
      room,
      gems,
    })
  }
}

/**
 * Whether a photo can be paid for
 * @class
 */
@Packet(Outgoing.AvatarPhotoCheck, 'xt')
export class AvatarPhotoCheckOutgoing extends OutgoingPacket {
  /**
   * The player's gems, or -1
   */
  @Field.int() public readonly gems: number = 0

  /**
   * Says the photo can be paid for
   * @param room The room
   * @param gems The player's gems
   * @returns The packet
   */
  public static affordable(
    room: number,
    gems: number,
  ): AvatarPhotoCheckOutgoing {
    return PacketFactory.create<AvatarPhotoCheckOutgoing>(
      AvatarPhotoCheckOutgoing,
      {
        room,
        gems,
      },
    )
  }

  /**
   * Says it can't
   * @param room The room
   * @returns The packet
   */
  public static refused(room: number): AvatarPhotoCheckOutgoing {
    return PacketFactory.create<AvatarPhotoCheckOutgoing>(
      AvatarPhotoCheckOutgoing,
      {
        room,
        gems: -1,
      },
    )
  }
}
