import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Claims mastery points for a pet
 * @class
 */
@Packet(Incoming.MinigameMastery, 'xt')
export class MinigameMasteryIncoming extends IncomingPacket {
  /**
   * The folded amount
   */
  @Field.number() public readonly amountSum: number = 0

  /**
   * The folded game
   */
  @Field.number() public readonly gameSum: number = 0

  /**
   * The check
   */
  @Field.number() public readonly checkSum: number = 0
}
