/**
 * The currencies, in the client's order
 */
export const CURRENCIES = [
  'gems',
  'tickets',
  'orbs',
  'diamonds',
  'straw',
  'bamboo',
  'wood',
  'stone',
  'silver',
  'gold',
  'gemstone',
  'ecoCredits',
] as const

/**
 * One of the currency names
 */
export type Currency = (typeof CURRENCIES)[number]
