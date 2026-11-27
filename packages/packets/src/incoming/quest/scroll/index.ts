import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Moves in a side scrolling adventure
 * @class
 */
@Packet(Incoming.QuestScroll, 'xt')
export class QuestScrollIncoming extends IncomingPacket {
  /**
   * Where across
   */
  @Field.int() public readonly x: number = 0

  /**
   * Where down
   */
  @Field.int() public readonly y: number = 0

  /**
   * The keys down and the move
   */
  @Field.int() public readonly flags: number = 0
}
