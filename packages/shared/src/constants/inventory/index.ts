/**
 * How much a player can own
 */
export const InventoryLimit = {
  /**
   * Clothing
   */
  Clothing: 100,

  /**
   * Clothing with extended storage
   */
  ExtendedClothing: 1000,

  /**
   * Den items
   */
  DenItems: 400,

  /**
   * Den items with extended storage
   */
  ExtendedDenItems: 2000,

  /**
   * Placed den items
   */
  PlacedDenItems: 301,

  /**
   * The highest den room slot
   */
  DenRoomSlot: 199,

  /**
   * Pets
   */
  Pets: 1000,

  /**
   * Buddies
   */
  Buddies: 200,

  /**
   * Buddies for members
   */
  MemberBuddies: 1000,

  /**
   * Listings on one den shop stand
   */
  DenShopListings: 24,
} as const

export type InventoryLimit =
  (typeof InventoryLimit)[keyof typeof InventoryLimit]
