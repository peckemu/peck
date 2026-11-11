import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Buys a den item or den room
 * @class
 */
@Packet(Incoming.DenBuy, 'xt')
export class DenBuyIncoming extends IncomingPacket {
  /**
   * 0 den item, -1 den room
   */
  @Field.int() public readonly kind: number = 0

  /**
   * The shop's list id
   */
  @Field.int() public readonly shopId: number = 0

  /**
   * The den item or room
   */
  @Field.int() public readonly defId: number = 0

  /**
   * The look or slot
   */
  @Field.int() public readonly versionOrSlot: number = 0

  /**
   * Whether it was bought with diamonds
   */
  @Field.int() public readonly diamond: number = 0

  /**
   * The rest
   */
  @Field.rest() public readonly rest: readonly string[] = []
}
