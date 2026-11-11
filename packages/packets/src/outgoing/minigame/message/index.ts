import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A message to a minigame
 * @class
 */
@Packet(Outgoing.MinigameMessage, 'xt')
export class MinigameMessageOutgoing extends OutgoingPacket {
  /**
   * What is said
   */
  @Field.rest() public readonly data: readonly string[] = []

  /**
   * Tells a game its own message
   * @param room The game's room
   * @param data The command and its fields
   * @returns The packet
   */
  public static of(
    room: number,
    data: readonly string[],
  ): MinigameMessageOutgoing {
    return PacketFactory.create<MinigameMessageOutgoing>(
      MinigameMessageOutgoing,
      {
        room,
        data,
      },
    )
  }

  /**
   * Gives the art studio its upload token
   * @param room The room
   * @param token The token, or null
   * @returns The packet
   */
  public static token(
    room: number,
    token: string | null,
  ): MinigameMessageOutgoing {
    return PacketFactory.create<MinigameMessageOutgoing>(
      MinigameMessageOutgoing,
      {
        room,
        data: ['tkn', token === null ? '0' : '1', '0', token ?? '', '0', '1'],
      },
    )
  }
}
