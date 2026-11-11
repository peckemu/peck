/**
 * An hour in milliseconds
 */
const HOUR = 3_600_000

/**
 * A minute in milliseconds
 */
const MINUTE = 60_000

/**
 * The longest sanction in hours
 */
const LONGEST_HOURS = 24 * 365 * 10

/**
 * How long bans and mutes last
 * @class
 */
export class ModerationRules {
  /**
   * Finds a ban's end
   * @param hours The ban's length
   * @param now The time
   * @returns The end, or null
   */
  public static banEnds(hours: number, now = Date.now()): Date | null {
    if (!Number.isFinite(hours) || hours <= 0) return null

    return new Date(now + Math.min(hours, LONGEST_HOURS) * HOUR)
  }

  /**
   * Finds a mute's end
   * @param minutes The mute's length
   * @param now The time
   * @returns The end, or null
   */
  public static muteEnds(minutes: number, now = Date.now()): Date | null {
    if (!Number.isFinite(minutes) || minutes < 0) return null

    return new Date(now + Math.min(minutes, LONGEST_HOURS * 60) * MINUTE)
  }

  /**
   * Counts the seconds left
   * @param ends The end, or null
   * @param now The time
   * @returns The seconds, or -1
   */
  public static secondsLeft(ends: number | null, now = Date.now()): number {
    if (ends === null) return -1

    return Math.max(1, Math.ceil((ends - now) / 1000))
  }

  /**
   * Counts the minutes left
   * @param ends The end, or null
   * @param now The time
   * @returns The minutes, or -1
   */
  public static minutesLeft(ends: number | null, now = Date.now()): number {
    if (ends === null) return -1

    return Math.max(1, Math.ceil((ends - now) / MINUTE))
  }
}
