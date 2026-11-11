import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A player left a minigame
 * @class
 */
@Packet(Outgoing.MinigameLeft, 'xt')
export class MinigameLeftOutgoing extends OutgoingPacket {
  /**
   * Their session id
   */
  @Field.int() public readonly userId: number = 0

  /**
   * Says a player left
   * @param room The game's room
   * @param userId Their session id
   * @returns The packet
   */
  public static of(room: number, userId: number): MinigameLeftOutgoing {
    return PacketFactory.create<MinigameLeftOutgoing>(MinigameLeftOutgoing, {
      room,
      userId,
    })
  }
}
