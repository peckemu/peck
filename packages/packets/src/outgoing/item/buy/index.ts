import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * What came of a purchase
 */
export const BuyStatus = {
  /**
   * Bought
   */
  Bought: 1,

  /**
   * Couldn't be bought
   */
  Refused: 0,

  /**
   * No longer for sale
   */
  Gone: -2,
} as const

export type BuyStatus = (typeof BuyStatus)[keyof typeof BuyStatus]

/**
 * Whether clothing was bought
 * @class
 */
@Packet(Outgoing.ItemBuy, 'xt')
export class ItemBuyOutgoing extends OutgoingPacket {
  /**
   * What came of it
   */
  @Field.int() public readonly status: number = 0

  /**
   * The shop's list id
   */
  @Field.int() public readonly shopId: number = 0

  /**
   * The new balance
   */
  @Field.string() public readonly balance: string = ''

  /**
   * The balance's currency
   */
  @Field.int() public readonly currencyType: number = 0

  /**
   * Says it was bought
   * @param room The target room
   * @param shopId The shop's list id
   * @param balance The balance afterwards
   * @param currencyType The balance's currency
   * @returns The packet
   */
  public static bought(
    room: number,
    shopId: number,
    balance: string,
    currencyType: number,
  ): ItemBuyOutgoing {
    return ItemBuyOutgoing.build(
      room,
      BuyStatus.Bought,
      shopId,
      balance,
      currencyType,
    )
  }

  /**
   * Says it couldn't be bought
   * @param room The target room
   * @param shopId The shop's list id
   * @param status Why
   * @returns The packet
   */
  public static refused(
    room: number,
    shopId: number,
    status: BuyStatus = BuyStatus.Refused,
  ): ItemBuyOutgoing {
    return ItemBuyOutgoing.build(room, status, shopId, '', 0)
  }

  /**
   * Builds the packet
   * @param room The target room
   * @param status What came of it
   * @param shopId The shop's list id
   * @param balance The balance afterwards
   * @param currencyType The balance's currency
   * @returns The packet
   */
  private static build(
    room: number,
    status: number,
    shopId: number,
    balance: string,
    currencyType: number,
  ): ItemBuyOutgoing {
    return PacketFactory.create<ItemBuyOutgoing>(ItemBuyOutgoing, {
      room,
      status,
      shopId,
      balance,
      currencyType,
    })
  }
}
