import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * A gift picked
 * @class
 */
abstract class GiftPacket extends IncomingPacket {
  /**
   * The gift, or -1
   */
  @Field.int() public readonly index: number = -1

  /**
   * Whether too few crystals were gathered
   */
  @Field.int() public readonly belowGoal: number = 0

  /**
   * Whether it was thrown away
   */
  @Field.int() public readonly discarded: number = 0
}

/**
 * Picks a gift
 * @class
 */
@Packet(Incoming.QuestGift, 'xt')
export class QuestGiftIncoming extends GiftPacket {}

/**
 * Picks a gift of their own
 * @class
 */
@Packet(Incoming.QuestPlayerGift, 'xt')
export class QuestPlayerGiftIncoming extends GiftPacket {}
