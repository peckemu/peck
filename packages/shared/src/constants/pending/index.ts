/**
 * Bits of a player's pending flags
 */
export const PendingFlag = {
  /**
   * The tour is done
   */
  FirstFiveMinutes: 0x1,
  /**
   * The player has extended storage
   */
  ExtendedStorage: 0x2,
  /**
   * The player has no animal yet
   */
  NeedsFirstAvatar: 0x10,
} as const

export type PendingFlag = (typeof PendingFlag)[keyof typeof PendingFlag]
