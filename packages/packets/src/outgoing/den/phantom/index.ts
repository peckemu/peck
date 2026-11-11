import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A player turned into a phantom or back
 * @class
 */
@Packet(Outgoing.DenPhantom, 'xt')
export class DenPhantomOutgoing extends OutgoingPacket {
  /**
   * Whether it went through
   */
  @Field.bool() public readonly success: boolean = false

  /**
   * The player's SmartFox user id
   */
  @Field.int() public readonly userId: number = 0

  /**
   * Whether they are a phantom
   */
  @Field.bool() public readonly phantom: boolean = false

  /**
   * Says a player turned into a phantom or back
   * @param room The target room
   * @param userId The player's SmartFox user id
   * @param phantom Whether they are a phantom
   * @returns The packet
   */
  public static of(
    room: number,
    userId: number,
    phantom: boolean,
  ): DenPhantomOutgoing {
    return PacketFactory.create<DenPhantomOutgoing>(DenPhantomOutgoing, {
      room,
      success: true,
      userId,
      phantom,
    })
  }
}
