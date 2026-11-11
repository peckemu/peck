import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A player at a minigame
 */
export type SeatedPlayer = {
  /**
   * Their session id
   */
  readonly userId: number

  /**
   * Their avatar
   */
  readonly perUserAvId: number

  /**
   * Their username
   */
  readonly userName: string
}

/**
 * A minigame starts
 * @class
 */
@Packet(Outgoing.MinigameStart, 'xt')
export class MinigameStartOutgoing extends OutgoingPacket {
  /**
   * The players
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Starts the game
   * @param room The game's room
   * @param players The players
   * @param pattern The game's layout, or null
   * @returns The packet
   */
  public static of(
    room: number,
    players: readonly SeatedPlayer[],
    pattern: number | null = null,
  ): MinigameStartOutgoing {
    const body = [
      String(players.length),
      ...players.map(({ userId }) => String(userId)),
      ...players.flatMap(({ perUserAvId, userName }) => [
        String(perUserAvId),
        userName,
      ]),
      ...(pattern === null ? [] : [String(pattern)]),
    ]

    return PacketFactory.create<MinigameStartOutgoing>(MinigameStartOutgoing, {
      room,
      body,
    })
  }
}
