/**
 * A seat at a two player game
 */
export type SeatIndex = 0 | 1

/**
 * How a game came out for one player
 */
export type Outcome = 'won' | 'tied' | 'lost'

/**
 * How a game came out for both seats
 */
export type Outcomes = readonly [Outcome, Outcome]

/**
 * A message to a game
 */
export type Told = {
  /**
   * The seat told, or null for both
   */
  readonly to: SeatIndex | null

  /**
   * What the game is told
   */
  readonly data: readonly string[]
}

/**
 * A whole number as the games write one
 */
const WHOLE = /^-?\d{1,6}$/

/**
 * A number as the games write one
 */
const DECIMAL = /^-?(\d+(\.\d*)?|\.\d+)(e[-+]?\d+)?$/i

/**
 * The longest number kept
 */
const LONGEST_DECIMAL = 24

/**
 * Referees a two player game
 * @class
 */
export abstract class Referee {
  /**
   * Whether the players claim the result
   */
  public readonly claimsResult: boolean = false

  /**
   * The players' session ids
   */
  protected readonly ids: readonly [number, number]

  /**
   * Rolls a number from 0 to 1
   */
  protected readonly random: () => number

  /**
   * Creates the referee
   * @param ids The players' session ids
   * @param random Rolls a number from 0 to 1
   */
  public constructor(ids: readonly [number, number], random: () => number) {
    this.ids = ids
    this.random = random
  }

  /**
   * Starts a round
   * @returns What to tell
   */
  public abstract ready(): readonly Told[]

  /**
   * Reads a game message
   * @param seat The seat it came from
   * @param data The command and its fields
   * @returns What to tell
   */
  public abstract message(
    seat: SeatIndex,
    data: readonly string[],
  ): readonly Told[]

  /**
   * How the game came out
   * @returns The outcomes, or null
   */
  public outcome(): Outcomes | null {
    return null
  }

  /**
   * The start's layout
   * @returns The layout, or null
   */
  public pattern(): number | null {
    return null
  }

  /**
   * Finds the other seat
   * @param seat The seat
   * @returns The other seat
   */
  protected static other(seat: SeatIndex): SeatIndex {
    return seat === 0 ? 1 : 0
  }

  /**
   * Rolls a seat
   * @param random Rolls a number from 0 to 1
   * @returns The seat
   */
  protected static either(random: () => number): SeatIndex {
    return random() < 0.5 ? 0 : 1
  }

  /**
   * Reads a whole number
   * @param text The text
   * @param min The lowest allowed
   * @param max The highest allowed
   * @returns The number, or null
   */
  protected static whole(
    text: string | undefined,
    min: number,
    max: number,
  ): number | null {
    if (text === undefined || !WHOLE.test(text)) return null

    const value = Number(text)
    return value >= min && value <= max ? value : null
  }

  /**
   * Reads a number kept as text
   * @param text The text
   * @returns The text, or null
   */
  protected static decimal(text: string | undefined): string | null {
    const valid =
      text !== undefined &&
      text.length <= LONGEST_DECIMAL &&
      DECIMAL.test(text) &&
      Number.isFinite(Number(text))

    return valid ? text : null
  }

  /**
   * Builds a message for both seats
   * @param data The command and its fields
   * @returns The message
   */
  protected static both(...data: readonly (string | number)[]): Told {
    return { to: null, data: data.map(String) }
  }

  /**
   * Builds a message for one seat
   * @param seat The seat
   * @param data The command and its fields
   * @returns The message
   */
  protected static to(
    seat: SeatIndex,
    ...data: readonly (string | number)[]
  ): Told {
    return { to: seat, data: data.map(String) }
  }

  /**
   * Writes a flag
   * @param value The flag
   * @returns The text
   */
  protected static flag(value: boolean): string {
    return value ? '1' : '0'
  }

  /**
   * Builds the outcomes for a winner
   * @param winner The winning seat
   * @returns The outcomes
   */
  protected static wonBy(winner: SeatIndex): Outcomes {
    return winner === 0 ? ['won', 'lost'] : ['lost', 'won']
  }
}
