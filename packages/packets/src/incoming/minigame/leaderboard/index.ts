import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for a minigame's leaderboards
 * @class
 */
@Packet(Incoming.MinigameLeaderboard, 'xt')
export class MinigameLeaderboardIncoming extends IncomingPacket {
  /**
   * The game
   */
  @Field.int() public readonly gameDefId: number = 0
}
