/**
 * What a shop list holds
 */
export const ShopListType = {
  /**
   * Clothing
   */
  Clothing: 1000,

  /**
   * Animals
   */
  Avatars: 1003,

  /**
   * Den items
   */
  DenItems: 1030,

  /**
   * Den rooms
   */
  DenRooms: 1040,

  /**
   * Currency exchanges
   */
  CurrencyExchange: 1051,

  /**
   * Diamond shop entries
   */
  DiamondShop: 1054,

  /**
   * Several kinds
   */
  Combined: 1060,
} as const

export type ShopListType = (typeof ShopListType)[keyof typeof ShopListType]

/**
 * A mixed currency type
 */
export const COMBINED_CURRENCY = 100

/**
 * The store status of something on sale
 */
export const ON_SALE = 2

/**
 * The recycling refund share
 */
export const RECYCLE_PERCENTAGE = Math.fround(0.3)
