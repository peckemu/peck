import {
  type Outcomes,
  Referee,
  type SeatIndex,
  type Told,
} from '#game/minigame/referee'

/**
 * The scoops and toppings
 */
const CHOICES = /^(flav[0-5]|top[0-2])$/

/**
 * The fewest clicks the cones take
 */
const FEWEST_CLICKS = 1 + 2 + 4 + 5 + 7

/**
 * Referees Scooped
 * @class
 */
export class ScoopedReferee extends Referee {
  /**
   * Whether the game started
   */
  private started = false

  /**
   * The clicks each seat made
   */
  private readonly clicks: [number, number] = [0, 0]

  /**
   * How it came out
   */
  private result: Outcomes | null = null

  /**
   * Starts the cones
   * @returns What to tell
   */
  public ready(): readonly Told[] {
    if (this.started) return []

    this.started = true

    return [Referee.both('start')]
  }

  /**
   * Passes a click on
   * @param seat The seat it came from
   * @param data The command and its fields
   * @returns What to tell
   */
  public message(seat: SeatIndex, data: readonly string[]): readonly Told[] {
    const [command, choice] = data
    if (!this.started || this.result) return []

    if (command === 'sc_click') {
      if (choice === undefined || !CHOICES.test(choice)) return []

      this.clicks[seat]++
      return [Referee.to(Referee.other(seat), 'sc_click', choice)]
    }

    if (command === 'sc_done' && this.clicks[seat] >= FEWEST_CLICKS) {
      this.result = Referee.wonBy(seat)
      return [Referee.both('sc_done', seat)]
    }

    return []
  }

  /**
   * How the game came out
   * @returns The outcomes, or null
   */
  public override outcome(): Outcomes | null {
    return this.result
  }
}
