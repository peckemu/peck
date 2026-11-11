/**
 * A two player game answer
 */
export const PvpAction = {
  /**
   * Asks or accepts
   */
  Ask: 0,

  /**
   * Turns down or calls off
   */
  Refuse: 1,
} as const

export type PvpAction = (typeof PvpAction)[keyof typeof PvpAction]

/**
 * The settings bit turning game invites off
 */
export const GAME_INVITES_OFF = 1
