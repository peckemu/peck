import {
  COMBINED_CURRENCY,
  CURRENCIES,
  ON_SALE,
  RECYCLE_PERCENTAGE,
} from '@peck/shared'

import { type DenItemCatalogue } from '#game/content/den-item'
import { type DenRoomCatalogue } from '#game/content/den-room'
import { type DiamondCatalogue, DiamondType } from '#game/content/diamond'
import { type ExchangeCatalogue } from '#game/content/exchange'
import { type ItemCatalogue } from '#game/content/item'
import { type Wallet } from '#game/wallet'

/**
 * The diamonds currency
 */
const DIAMONDS = 3

/**
 * The gems currency
 */
const GEMS = 0

/**
 * An amount of one currency
 */
export type Cost = {
  /**
   * The currency
   */
  readonly currency: number

  /**
   * How much
   */
  readonly amount: number
}

/**
 * What something costs
 */
export type Price = {
  /**
   * The currency type
   */
  readonly currency: number

  /**
   * What is paid
   */
  readonly costs: readonly Cost[]
}

/**
 * Something a shop can sell
 */
export type Offer = {
  /**
   * The bought definition id
   */
  readonly defId: number

  /**
   * The diamond shop entry, or 0
   */
  readonly diamondDefId: number

  /**
   * Whether only members can buy it
   */
  readonly membersOnly: boolean

  /**
   * What it costs
   */
  readonly price: Price
}

/**
 * A currency exchange priced
 */
export type Exchange = {
  /**
   * The exchange's definition id
   */
  readonly defId: number

  /**
   * What is paid
   */
  readonly price: Price

  /**
   * What is given
   */
  readonly gain: Cost
}

/**
 * A price source
 */
type Priced = {
  readonly defId: number
  readonly cost: number
  readonly currencyType: number
  readonly combinedCost: string
  readonly status: number
  readonly membersOnly: boolean
}

/**
 * Works out what things cost
 * @class
 */
export class Prices {
  /**
   * Every clothing item
   */
  private readonly items: ItemCatalogue

  /**
   * Every den item
   */
  private readonly denItems: DenItemCatalogue

  /**
   * Every den room
   */
  private readonly denRooms: DenRoomCatalogue

  /**
   * Every diamond shop entry
   */
  private readonly diamonds: DiamondCatalogue

  /**
   * Every currency exchange
   */
  private readonly exchanges: ExchangeCatalogue

  /**
   * Creates the prices
   * @param items Every clothing item
   * @param denItems Every den item
   * @param denRooms Every den room
   * @param diamonds Every diamond shop entry
   * @param exchanges Every currency exchange
   */
  public constructor(
    items: ItemCatalogue,
    denItems: DenItemCatalogue,
    denRooms: DenRoomCatalogue,
    diamonds: DiamondCatalogue,
    exchanges: ExchangeCatalogue,
  ) {
    this.items = items
    this.denItems = denItems
    this.denRooms = denRooms
    this.diamonds = diamonds
    this.exchanges = exchanges
  }

  /**
   * Prices a clothing item
   * @param defId Its definition or diamond entry id
   * @param diamond Whether it costs diamonds
   * @returns The offer, or null
   */
  public clothing(defId: number, diamond: boolean): Offer | null {
    return this.offer(defId, diamond, DiamondType.Clothing, (id) =>
      this.items.get(id),
    )
  }

  /**
   * Prices a den item
   * @param defId Its definition or diamond entry id
   * @param diamond Whether it costs diamonds
   * @returns The offer, or null
   */
  public denItem(defId: number, diamond: boolean): Offer | null {
    return this.offer(defId, diamond, DiamondType.DenItem, (id) =>
      this.denItems.get(id),
    )
  }

  /**
   * Prices a den room
   * @param defId Its definition or diamond entry id
   * @param diamond Whether it costs diamonds
   * @returns The offer, or null
   */
  public denRoom(defId: number, diamond: boolean): Offer | null {
    return this.offer(defId, diamond, DiamondType.DenRoom, (id) => {
      const room = this.denRooms.get(id)

      return room
        ? { ...room, currencyType: GEMS, combinedCost: '', status: 0 }
        : null
    })
  }

  /**
   * Prices a currency exchange
   * @param defId Its definition id
   * @returns The exchange, or null
   */
  public exchange(defId: number): Exchange | null {
    const exchange = this.exchanges.get(defId)
    if (!exchange) return null

    const price = Prices.own({
      ...exchange,
      status: 0,
      membersOnly: false,
    })

    return {
      defId: exchange.defId,
      price,
      gain: { currency: exchange.resultType, amount: exchange.result },
    }
  }

  /**
   * Finds what recycling a clothing item gives
   * @param defId Its definition id
   * @returns The gems
   */
  public clothingRecycle(defId: number): number {
    const item = this.items.get(defId)

    return item ? Prices.recycle(item.cost, item.recycleValue) : 0
  }

  /**
   * Finds what recycling a den item gives
   * @param defId Its definition id
   * @returns The gems
   */
  public denItemRecycle(defId: number): number {
    const item = this.denItems.get(defId)

    return item ? Prices.recycle(item.cost, item.recycleValue) : 0
  }

  /**
   * Finds what recycling a den room gives
   * @param defId Its definition id
   * @returns The gems
   */
  public denRoomRecycle(defId: number): number {
    const room = this.denRooms.get(defId)

    return room ? Prices.recycle(room.cost, 0) : 0
  }

  /**
   * Writes the purchase balance
   * @param price The price paid
   * @param wallet The player's wallet
   * @returns The balance
   */
  public static balance(price: Price, wallet: Wallet): string {
    const balanceOf = (currency: number): number => {
      const name = CURRENCIES[currency]

      return name ? wallet.balance(name) : 0
    }

    if (price.currency !== COMBINED_CURRENCY) {
      return String(balanceOf(price.currency))
    }

    return price.costs
      .map(
        ({ currency }) => `${String(currency)}x${String(balanceOf(currency))}`,
      )
      .join(',')
  }

  /**
   * Reads a price in several currencies
   * @param text The price
   * @returns The costs
   */
  public static combined(text: string): Cost[] {
    if (text.trim() === '') return []

    return text.split(',').map((part) => {
      const [currency = '', amount = ''] = part.split('x')

      return {
        currency: Math.trunc(Number(currency)) || 0,
        amount: Math.trunc(Number(amount)) || 0,
      }
    })
  }

  /**
   * Prices something
   * @param defId Its definition or diamond entry id
   * @param diamond Whether it costs diamonds
   * @param type Its kind
   * @param find Finds its definition
   * @returns The offer, or null
   */
  private offer(
    defId: number,
    diamond: boolean,
    type: DiamondType,
    find: (defId: number) => Priced | null,
  ): Offer | null {
    if (!diamond) {
      if (this.diamonds.selling(type, defId)) return null

      const own = find(defId)

      return own
        ? {
            defId: own.defId,
            diamondDefId: 0,
            membersOnly: own.membersOnly,
            price: Prices.own(own),
          }
        : null
    }

    const entry = this.diamonds.get(defId)
    const real = entry?.type === type ? find(entry.refId) : null
    if (!entry || !real) return null

    const amount =
      entry.status === ON_SALE ? Math.ceil(entry.cost * 0.5) : entry.cost

    return {
      defId: real.defId,
      diamondDefId: entry.defId,
      membersOnly: real.membersOnly,
      price: { currency: DIAMONDS, costs: [{ currency: DIAMONDS, amount }] },
    }
  }

  /**
   * Prices a definition
   * @param priced The definition
   * @returns The price
   */
  private static own(priced: Priced): Price {
    if (priced.currencyType === COMBINED_CURRENCY) {
      return {
        currency: COMBINED_CURRENCY,
        costs: Prices.combined(priced.combinedCost),
      }
    }

    const amount =
      priced.status === ON_SALE ? Math.ceil(priced.cost * 0.5) : priced.cost

    return {
      currency: priced.currencyType,
      costs: [{ currency: priced.currencyType, amount }],
    }
  }

  /**
   * Works out a recycle value
   * @param cost The definition's cost
   * @param recycleValue The definition's recycle value
   * @returns The gems
   */
  private static recycle(cost: number, recycleValue: number): number {
    return recycleValue === 0
      ? Math.trunc(cost * RECYCLE_PERCENTAGE)
      : recycleValue
  }
}
