import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Changes the trade list
 * @class
 */
@Packet(Incoming.TradeListChange, 'xt')
export class TradeListChangeIncoming extends IncomingPacket {
  /**
   * What comes off and goes on
   */
  @Field.rest(Field.int()) public readonly body: readonly number[] = []
}
