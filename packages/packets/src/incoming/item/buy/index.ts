import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Buys clothing
 * @class
 */
@Packet(Incoming.ItemBuy, 'xt')
export class ItemBuyIncoming extends IncomingPacket {
  /**
   * The shop's list id
   */
  @Field.int() public readonly shopId: number = 0

  /**
   * The count
   */
  @Field.int() public readonly quantity: number = 1

  /**
   * The item, or its diamond entry
   */
  @Field.int() public readonly defId: number = 0

  /**
   * Which of its colours
   */
  @Field.int() public readonly colorIndex: number = 0

  /**
   * Whether it was bought with diamonds
   */
  @Field.int() public readonly diamond: number = 0

  /**
   * The charm's den item, or -1
   */
  @Field.int() public readonly targetInvId: number = -1

  /**
   * The den item's owner
   */
  @Field.string() public readonly targetUserName: string = ''
}
