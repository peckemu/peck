import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A player on a leaderboard
 */
export type RankedPlayer = {
  /**
   * Their username
   */
  readonly username: string

  /**
   * Their best score
   */
  readonly score: number
}

/**
 * One leaderboard
 */
export type Leaderboard = {
  /**
   * The player's own best, or -1
   */
  readonly own: number

  /**
   * The best players
   */
  readonly top: readonly RankedPlayer[]
}

/**
 * A minigame's leaderboards
 * @class
 */
@Packet(Outgoing.MinigameLeaderboard, 'xt')
export class MinigameLeaderboardOutgoing extends OutgoingPacket {
  /**
   * The boards
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Sends the leaderboards
   * @param room The target room
   * @param gameDefId The game
   * @param userName The player asking
   * @param boards The boards
   * @returns The packet
   */
  public static of(
    room: number,
    gameDefId: number,
    userName: string,
    boards: readonly Leaderboard[],
  ): MinigameLeaderboardOutgoing {
    const body = [
      String(gameDefId),
      ...boards.flatMap(({ own, top }) => [
        String(top.length + 1),
        userName,
        String(own),
        ...top.flatMap(({ username, score }) => [username, String(score)]),
      ]),
    ]

    return PacketFactory.create<MinigameLeaderboardOutgoing>(
      MinigameLeaderboardOutgoing,
      {
        room,
        body,
      },
    )
  }

  /**
   * Says there is no leaderboard
   * @param room The target room
   * @returns The packet
   */
  public static none(room: number): MinigameLeaderboardOutgoing {
    return PacketFactory.create<MinigameLeaderboardOutgoing>(
      MinigameLeaderboardOutgoing,
      {
        room,
        body: ['-1'],
      },
    )
  }
}
