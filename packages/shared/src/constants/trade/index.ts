/**
 * What can be traded
 */
export const TradeKind = {
  /**
   * A den item
   */
  DenItem: 0,

  /**
   * A pet
   */
  Pet: 1,

  /**
   * Clothing
   */
  Clothing: 2,
} as const

export type TradeKind = (typeof TradeKind)[keyof typeof TradeKind]
