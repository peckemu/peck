/**
 * Who may visit a den
 */
export const DenPrivacy = {
  /**
   * Nobody
   */
  Locked: 0,

  /**
   * Buddies only
   */
  Buddies: 1,

  /**
   * Everyone
   */
  Open: 2,
} as const

export type DenPrivacy = (typeof DenPrivacy)[keyof typeof DenPrivacy]
