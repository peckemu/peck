import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Keeps a minigame score
 * @class
 */
@Packet(Incoming.MinigameScore, 'xt')
export class MinigameScoreIncoming extends IncomingPacket {
  /**
   * The folded score
   */
  @Field.number() public readonly mainSum: number = 0

  /**
   * One check
   */
  @Field.number() public readonly valueSum: number = 0

  /**
   * Another check
   */
  @Field.number() public readonly numSum: number = 0

  /**
   * The folded user variable
   */
  @Field.number() public readonly varRefSum: number = 0

  /**
   * The folded game
   */
  @Field.number() public readonly gameSum: number = 0
}
