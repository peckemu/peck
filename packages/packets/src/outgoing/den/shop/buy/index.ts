import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import {
  DenShopItemsOutgoing,
  type ShownListing,
} from '#packets/outgoing/den/shop/items'
import { Outgoing } from '#packets/outgoing/headers'

/**
 * A stand sale
 */
export type StandSaleView = {
  /**
   * The seller
   */
  readonly sellerUserName: string

  /**
   * The stand
   */
  readonly storeInvId: number

  /**
   * What was sold
   */
  readonly listing: ShownListing
}

/**
 * Something bought from a den shop stand
 * @class
 */
@Packet(Outgoing.DenShopBuy, 'xt')
export class DenShopBuyOutgoing extends OutgoingPacket {
  /**
   * Whether it was bought
   */
  @Field.int() public readonly status: number = 0

  /**
   * The sale
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Tells the buyer what they bought
   * @param room The target room
   * @param sale The sale
   * @param invIdx Where it went in their inventory
   * @param state The stand's state afterwards
   * @param balance Their balance afterwards
   * @returns The packet
   */
  public static toBuyer(
    room: number,
    sale: StandSaleView,
    invIdx: number,
    state: number,
    balance: number,
  ): DenShopBuyOutgoing {
    return DenShopBuyOutgoing.build(room, [
      sale.sellerUserName,
      String(sale.storeInvId),
      String(invIdx),
      String(state),
      ...DenShopItemsOutgoing.head(sale.listing),
      ...DenShopItemsOutgoing.look(sale.listing),
      String(balance),
    ])
  }

  /**
   * Tells the seller what they sold
   * @param sale The sale
   * @param balance Their balance afterwards
   * @returns The packet
   */
  public static toSeller(
    sale: StandSaleView,
    balance: number,
  ): DenShopBuyOutgoing {
    return DenShopBuyOutgoing.build(-1, [
      sale.sellerUserName,
      String(sale.storeInvId),
      ...DenShopItemsOutgoing.head(sale.listing),
      ...DenShopItemsOutgoing.look(sale.listing),
      String(balance),
    ])
  }

  /**
   * Says it couldn't be bought
   * @param room The target room
   * @returns The packet
   */
  public static refused(room: number): DenShopBuyOutgoing {
    return PacketFactory.create<DenShopBuyOutgoing>(DenShopBuyOutgoing, {
      room,
      status: 0,
      body: [],
    })
  }

  /**
   * Builds a sale
   * @param room The target room
   * @param body The sale
   * @returns The packet
   */
  private static build(
    room: number,
    body: readonly string[],
  ): DenShopBuyOutgoing {
    return PacketFactory.create<DenShopBuyOutgoing>(DenShopBuyOutgoing, {
      room,
      status: 1,
      body,
    })
  }
}
