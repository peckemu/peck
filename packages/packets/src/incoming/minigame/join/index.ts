import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Joins a minigame
 * @class
 */
@Packet(Incoming.MinigameJoin, 'xt')
export class MinigameJoinIncoming extends IncomingPacket {
  /**
   * The game
   */
  @Field.int() public readonly gameDefId: number = 0

  /**
   * Whether to play with others
   */
  @Field.int() public readonly multiplayer: number = 0

  /**
   * The pro mode, or 0
   */
  @Field.int() public readonly proModeId: number = 0

  /**
   * The host's session id, or -1
   */
  @Field.int() public readonly hostUserId: number = -1
}
