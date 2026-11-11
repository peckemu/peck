import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * An avatar leaves the room
 * @class
 */
@Packet(Outgoing.AvatarLeft, 'xt')
export class AvatarLeftOutgoing extends OutgoingPacket {
  /**
   * The player's session id
   */
  @Field.int() public readonly userId: number = 0

  /**
   * Removes an avatar from the room
   * @param room The room
   * @param userId The player's session id
   * @returns The packet
   */
  public static of(room: number, userId: number): AvatarLeftOutgoing {
    return PacketFactory.create<AvatarLeftOutgoing>(AvatarLeftOutgoing, {
      room,
      userId,
    })
  }
}
