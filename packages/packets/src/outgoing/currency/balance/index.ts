import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A balance changed
 * @class
 */
@Packet(Outgoing.Currency, 'xt')
export class CurrencyOutgoing extends OutgoingPacket {
  /**
   * The currency
   */
  @Field.int() public readonly currency: number = 0

  /**
   * The balance now
   */
  @Field.int() public readonly balance: number = 0

  /**
   * Why it changed
   */
  @Field.int() public readonly reason: number = 0

  /**
   * Says a balance changed
   * @param currency The currency
   * @param balance The balance now
   * @returns The packet
   */
  public static of(currency: number, balance: number): CurrencyOutgoing {
    return PacketFactory.create<CurrencyOutgoing>(CurrencyOutgoing, {
      room: -1,
      currency,
      balance,
      reason: 0,
    })
  }
}
