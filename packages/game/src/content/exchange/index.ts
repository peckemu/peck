import { Catalogue } from '#game/catalogue'

/**
 * A currency exchange
 */
export type ExchangeTemplate = {
  /**
   * The exchange's id in the exchange pack
   */
  readonly defId: number

  /**
   * What it costs
   */
  readonly cost: number

  /**
   * The paid currency
   */
  readonly currencyType: number

  /**
   * The price in several currencies
   */
  readonly combinedCost: string

  /**
   * How much it gives
   */
  readonly result: number

  /**
   * The given currency
   */
  readonly resultType: number

  /**
   * When it goes on sale
   */
  readonly availableFrom?: Date | null

  /**
   * When it comes off sale
   */
  readonly availableUntil?: Date | null
}

/**
 * Every currency exchange
 * @class
 */
export class ExchangeCatalogue extends Catalogue<ExchangeTemplate> {}
