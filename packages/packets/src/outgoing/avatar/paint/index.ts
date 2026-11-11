import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether the animal was recoloured
 * @class
 */
@Packet(Outgoing.AvatarPaint, 'xt')
export class AvatarPaintOutgoing extends OutgoingPacket {
  /**
   * Whether it was
   */
  @Field.int() public readonly result: number = 0

  /**
   * Says it was recoloured
   * @param room The room
   * @returns The packet
   */
  public static painted(room: number): AvatarPaintOutgoing {
    return PacketFactory.create<AvatarPaintOutgoing>(AvatarPaintOutgoing, {
      room,
      result: 1,
    })
  }

  /**
   * Says it wasn't
   * @param room The room
   * @returns The packet
   */
  public static refused(room: number): AvatarPaintOutgoing {
    return PacketFactory.create<AvatarPaintOutgoing>(AvatarPaintOutgoing, {
      room,
      result: 0,
    })
  }
}

/**
 * A player's name bar changed
 * @class
 */
@Packet(Outgoing.NameBar, 'xt')
export class NameBarOutgoing extends OutgoingPacket {
  /**
   * The player in the room
   */
  @Field.int() public readonly userId: number = 0

  /**
   * Their name bar
   */
  @Field.int() public readonly nameBarData: number = 0

  /**
   * Tells a room a name bar changed
   * @param room The room
   * @param userId The player in the room
   * @param nameBarData Their name bar
   * @returns The packet
   */
  public static of(
    room: number,
    userId: number,
    nameBarData: number,
  ): NameBarOutgoing {
    return PacketFactory.create<NameBarOutgoing>(NameBarOutgoing, {
      room,
      userId,
      nameBarData,
    })
  }
}
