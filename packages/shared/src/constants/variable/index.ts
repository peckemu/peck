/**
 * Known user variable ids
 */
export const UserVar = {
  /**
   * Gems earned
   */
  GemsEarned: 1,

  /**
   * Gems spent
   */
  GemsSpent: 2,

  /**
   * Den items bought
   */
  DenItemBuyCount: 3,

  /**
   * Clothing bought
   */
  ClothingBuyCount: 4,

  /**
   * Jam-a-grams sent
   */
  JamAGramsSent: 38,

  /**
   * Gifts sent
   */
  GiftsSent: 39,

  /**
   * Buddies added
   */
  BuddiesAdded: 40,

  /**
   * Pets adopted
   */
  PetCounter: 212,

  /**
   * The daily gem bonus
   */
  DailyGemBonus: 214,

  /**
   * The animals unlocked
   */
  AvatarViewableFlag: 287,

  /**
   * How many pets the player can keep
   */
  PetInventoryMax: 338,

  /**
   * The player's settings
   */
  Settings: 363,

  /**
   * The custom animals unlocked
   */
  CustomAvatarViewableFlag: 410,

  /**
   * The world items found
   */
  WorldItemsFound: 439,

  /**
   * The eco gift
   */
  EcoGift: 465,
} as const

export type UserVar = (typeof UserVar)[keyof typeof UserVar]

/**
 * User variable types
 */
export const UserVarType = {
  /**
   * A bit field
   */
  BitField: 3,

  /**
   * The settings bit field
   */
  Settings: 4,
} as const

export type UserVarType = (typeof UserVarType)[keyof typeof UserVarType]

/**
 * The bit field user variables
 */
export const BIT_FIELD_USER_VARS: ReadonlyMap<number, UserVarType> = new Map<
  number,
  UserVarType
>([
  ...[
    129, 133, 134, 135, 137, 138, 139, 140, 141, 142, 147, 215, 288, 289, 290,
    291, 295, 296, 298, 307, 311, 319, 320, 333, 337, 365, 366, 367, 371, 379,
    381, 401, 402, 407, 408, 411, 412, 416, 417, 418, 422, 456, 457, 459, 460,
    465,
  ].map((id): [number, UserVarType] => [id, UserVarType.BitField]),
  [UserVar.Settings, UserVarType.Settings],
])

/**
 * The server-only user variables
 */
export const SERVER_USER_VARS: ReadonlySet<number> = new Set<number>([
  UserVar.GemsEarned,
  UserVar.GemsSpent,
  UserVar.DenItemBuyCount,
  UserVar.ClothingBuyCount,
  UserVar.JamAGramsSent,
  UserVar.GiftsSent,
  UserVar.BuddiesAdded,
  UserVar.PetCounter,
  UserVar.DailyGemBonus,
  UserVar.AvatarViewableFlag,
  UserVar.PetInventoryMax,
  UserVar.CustomAvatarViewableFlag,
  UserVar.WorldItemsFound,
  UserVar.EcoGift,
])
