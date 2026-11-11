import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for a player's trade list
 * @class
 */
@Packet(Incoming.TradeList, 'xt')
export class TradeListIncoming extends IncomingPacket {
  /**
   * Whose trade list
   */
  @Field.string() public readonly userName: string = ''
}
