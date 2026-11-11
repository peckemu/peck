import { inject } from '@needle-di/core'
import { ShopRepository } from '@peck/database'
import { type Exchange, Prices, ShopStock } from '@peck/game'
import {
  CurrencyExchangeIncoming,
  CurrencyExchangeOutgoing,
  CurrencyOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'
import { CURRENCIES, ShopListType } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Exchanges one currency for another
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(CurrencyExchangeIncoming)
export class CurrencyExchangeHandler extends PacketHandler<CurrencyExchangeIncoming> {
  /**
   * Works out prices
   */
  private readonly prices = inject<Prices>(Prices)

  /**
   * The shop stock
   */
  private readonly stock = inject<ShopStock>(ShopStock)

  /**
   * Pays for things
   */
  private readonly shops = inject<ShopRepository>(ShopRepository)

  /**
   * Makes the exchange
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: CurrencyExchangeIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const exchange = this.prices.exchange(packet.defId)
    const refusal = this.refusal(packet, exchange)
    if (refusal !== null || !exchange) {
      context.log.info({ defId: packet.defId, refusal }, 'exchange refused')
      return session.send<CurrencyExchangeOutgoing>(
        CurrencyExchangeOutgoing.refused(packet.room),
      )
    }

    const balances = await this.shops.exchange(player.gameId, {
      shopId: packet.shopId,
      costs: exchange.price.costs,
      gain: exchange.gain,
    })
    if (!balances) {
      context.log.info({ defId: exchange.defId }, 'exchange not paid for')
      return session.send<CurrencyExchangeOutgoing>(
        CurrencyExchangeOutgoing.refused(packet.room),
      )
    }

    player.wallet.update(balances)

    const gained = CURRENCIES[exchange.gain.currency]
    await session.send<CurrencyExchangeOutgoing>(
      CurrencyExchangeOutgoing.exchanged(
        packet.room,
        Prices.balance(exchange.price, player.wallet),
      ),
    )
    if (!gained) return

    await session.send<CurrencyOutgoing>(
      CurrencyOutgoing.of(
        exchange.gain.currency,
        player.wallet.balance(gained),
      ),
    )
  }

  /**
   * Finds why an exchange can't be made
   * @param packet The packet
   * @param exchange The exchange
   * @returns The reason, or null
   */
  private refusal(
    packet: CurrencyExchangeIncoming,
    exchange: Exchange | null,
  ): string | null {
    if (!exchange) return 'no such exchange'

    const sold = this.stock.sells(
      packet.shopId,
      ShopListType.CurrencyExchange,
      exchange.defId,
      0,
    )
    if (!sold) return 'not sold here'

    if (exchange.price.costs.length === 0) return 'no price'
    if (!CURRENCIES[exchange.gain.currency]) return 'unknown currency'
    if (exchange.gain.amount <= 0) return 'nothing given'

    return null
  }
}
