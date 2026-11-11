import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Buys from a den shop stand
 * @class
 */
@Packet(Incoming.DenShopBuy, 'xt')
export class DenShopBuyIncoming extends IncomingPacket {
  /**
   * The seller
   */
  @Field.string() public readonly sellerUserName: string = ''

  /**
   * The stand
   */
  @Field.int() public readonly storeInvId: number = 0

  /**
   * The stand's state the buyer saw
   */
  @Field.string() public readonly state: string = '0'

  /**
   * Den item 0, pet 1 or clothing 2
   */
  @Field.int() public readonly itemKind: number = 0

  /**
   * Its place in the seller's inventory
   */
  @Field.int() public readonly invIdx: number = 0

  /**
   * The currency the buyer saw
   */
  @Field.int() public readonly currency: number = 0

  /**
   * The cost the buyer saw
   */
  @Field.int() public readonly cost: number = 0
}
