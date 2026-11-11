import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether an exchange worked
 * @class
 */
@Packet(Outgoing.CurrencyExchange, 'xt')
export class CurrencyExchangeOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.int() public readonly result: number = 0

  /**
   * The paid currency's balance
   */
  @Field.string() public readonly balance: string = ''

  /**
   * Says the exchange worked
   * @param room The target room
   * @param balance The balance afterwards
   * @returns The packet
   */
  public static exchanged(
    room: number,
    balance: string,
  ): CurrencyExchangeOutgoing {
    return PacketFactory.create<CurrencyExchangeOutgoing>(
      CurrencyExchangeOutgoing,
      { room, result: 1, balance },
    )
  }

  /**
   * Says the exchange failed
   * @param room The target room
   * @returns The packet
   */
  public static refused(room: number): CurrencyExchangeOutgoing {
    return PacketFactory.create<CurrencyExchangeOutgoing>(
      CurrencyExchangeOutgoing,
      { room, result: 0, balance: '' },
    )
  }
}
