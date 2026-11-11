/**
 * A day in milliseconds
 */
const DAY = 24 * 60 * 60 * 1000

/**
 * The first Jamaa day
 * @sxip I think this is the first day of the game world?
 */
const FIRST_DAY = Date.UTC(2010, 10, 30)

/**
 * Reads the game's date
 */
const UTAH = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Denver',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/**
 * Counts days the way the game does
 * @class
 */
export class JamaaCalendar {
  /**
   * Finds the Jamaa day at a moment
   * @param at The moment, in milliseconds
   * @returns The days since 30 November 2010
   */
  public static dayOf(at: number): number {
    const parts = Object.fromEntries(
      UTAH.formatToParts(new Date(at)).map((part) => [
        part.type,
        Number(part.value),
      ]),
    )
    const local = Date.UTC(
      parts['year'] ?? 0,
      (parts['month'] ?? 1) - 1,
      parts['day'] ?? 1,
    )
    return Math.round((local - FIRST_DAY) / DAY)
  }
}
