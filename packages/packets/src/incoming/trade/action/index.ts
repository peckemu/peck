import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Changes a trade
 * @class
 */
@Packet(Incoming.TradeAction, 'xt')
export class TradeActionIncoming extends IncomingPacket {
  /**
   * 0 offer, 1 answer, 2 cancel, 3 confirm
   */
  @Field.int() public readonly action: number = 0

  /**
   * The rest
   */
  @Field.rest() public readonly body: readonly string[] = []
}
