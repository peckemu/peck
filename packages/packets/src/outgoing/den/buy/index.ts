import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { BuyStatus } from '#packets/outgoing/item/buy'
import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether a den item or den room was bought
 * @class
 */
@Packet(Outgoing.DenBuy, 'xt')
export class DenBuyOutgoing extends OutgoingPacket {
  /**
   * What came of it
   */
  @Field.int() public readonly status: number = 0

  /**
   * The new balance
   */
  @Field.string() public readonly balance: string = ''

  /**
   * A field the client never reads
   */
  @Field.string() public readonly unused: string = ''

  /**
   * The balance's currency
   */
  @Field.int() public readonly currencyType: number = 0

  /**
   * Where it went in the inventory
   */
  @Field.int() public readonly invIdx: number = 0

  /**
   * Says it was bought
   * @param room The target room
   * @param balance The balance afterwards
   * @param currencyType The balance's currency
   * @param invIdx Where it went in the inventory
   * @returns The packet
   */
  public static bought(
    room: number,
    balance: string,
    currencyType: number,
    invIdx: number,
  ): DenBuyOutgoing {
    return DenBuyOutgoing.build(
      room,
      BuyStatus.Bought,
      balance,
      currencyType,
      invIdx,
    )
  }

  /**
   * Says it couldn't be bought
   * @param room The target room
   * @param status Why
   * @returns The packet
   */
  public static refused(
    room: number,
    status: BuyStatus = BuyStatus.Refused,
  ): DenBuyOutgoing {
    return DenBuyOutgoing.build(room, status, '', 0, 0)
  }

  /**
   * Builds the packet
   * @param room The target room
   * @param status What came of it
   * @param balance The balance afterwards
   * @param currencyType The balance's currency
   * @param invIdx Where it went in the inventory
   * @returns The packet
   */
  private static build(
    room: number,
    status: number,
    balance: string,
    currencyType: number,
    invIdx: number,
  ): DenBuyOutgoing {
    return PacketFactory.create<DenBuyOutgoing>(DenBuyOutgoing, {
      room,
      status,
      balance,
      unused: '',
      currencyType,
      invIdx,
    })
  }
}
