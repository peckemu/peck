import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Exchanges one currency for another
 * @class
 */
@Packet(Incoming.CurrencyExchange, 'xt')
export class CurrencyExchangeIncoming extends IncomingPacket {
  /**
   * The shop's list id
   */
  @Field.int() public readonly shopId: number = 0

  /**
   * The exchange's definition id
   */
  @Field.int() public readonly defId: number = 0
}
