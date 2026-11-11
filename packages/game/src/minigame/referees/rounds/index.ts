import {
  type Outcomes,
  Referee,
  type SeatIndex,
  type Told,
} from '#game/minigame/referee'

/**
 * The hands
 */
const HANDS: ReadonlySet<string> = new Set<string>([
  'rock',
  'paper',
  'scissors',
])

/**
 * What each hand beats
 */
const BEATS: Readonly<Record<string, string>> = {
  rock: 'scissors',
  paper: 'rock',
  scissors: 'paper',
}

/**
 * Referees a game of rounds chosen at once
 * @class
 */
export abstract class RoundsReferee extends Referee {
  /**
   * Rounds won that win the match
   */
  protected abstract readonly roundsToWin: number

  /**
   * Draws that tie the match, or null
   */
  protected abstract readonly drawsToTie: number | null

  /**
   * The round being played, or null
   */
  private round: { readonly roll: number | null } | null = null

  /**
   * What each seat chose
   */
  private choices: [string | null, string | null] = [null, null]

  /**
   * The rounds each seat won
   */
  private readonly won: [number, number] = [0, 0]

  /**
   * The rounds neither won
   */
  private draws = 0

  /**
   * How it came out
   */
  private result: Outcomes | null = null

  /**
   * Opens a round
   * @returns What to tell
   */
  public ready(): readonly Told[] {
    if (this.result) return []

    this.round = { roll: this.roll() }
    this.choices = [null, null]

    return [Referee.both(...this.opened(this.round.roll))]
  }

  /**
   * Takes a choice
   * @param seat The seat it came from
   * @param data The command and its fields
   * @returns What to tell
   */
  public message(seat: SeatIndex, data: readonly string[]): readonly Told[] {
    const [command, text] = data
    if (command !== 'time' || !this.round || this.result) return []
    if (this.choices[seat] !== null) return []

    this.choices[seat] = this.choice(text)
    const [first, second] = this.choices
    if (first === null || second === null) return []

    const winner = this.winner(first, second, this.round.roll)
    this.round = null

    if (winner === null) {
      this.draws++
      if (this.drawsToTie !== null && this.draws >= this.drawsToTie) {
        this.result = ['tied', 'tied']
      }
      return [Referee.both('mark', first, second, 0, 0, 0)]
    }

    this.won[winner]++
    if (this.won[winner] >= this.roundsToWin) {
      this.result = Referee.wonBy(winner)
      return [Referee.both('mark', first, second, 1, winner)]
    }

    return [Referee.both('mark', first, second, 0, 1, winner)]
  }

  /**
   * How the game came out
   * @returns The outcomes, or null
   */
  public override outcome(): Outcomes | null {
    return this.result
  }

  /**
   * Reads a choice
   * @param text The choice sent
   * @returns The choice
   */
  protected abstract choice(text: string | undefined): string

  /**
   * Rolls the round
   * @returns The roll, or null
   */
  protected abstract roll(): number | null

  /**
   * Writes the round's start
   * @param roll The round's roll
   * @returns The command and its fields
   */
  protected abstract opened(roll: number | null): readonly (string | number)[]

  /**
   * Finds who won a round
   * @param first The first seat's choice
   * @param second The second seat's choice
   * @param roll The round's roll
   * @returns The seat, or null
   */
  protected abstract winner(
    first: string,
    second: string,
    roll: number | null,
  ): SeatIndex | null
}

/**
 * Referees Rock Paper Scissors
 * @class
 */
export class RockPaperScissorsReferee extends RoundsReferee {
  /**
   * Rounds won that win the match
   */
  protected readonly roundsToWin = 2

  /**
   * Draws that tie the match
   */
  protected readonly drawsToTie = null

  /**
   * Reads a hand
   * @param text The hand sent
   * @returns The hand
   */
  protected choice(text: string | undefined): string {
    return text !== undefined && HANDS.has(text) ? text : 'off'
  }

  /**
   * Rolls nothing
   * @returns Null
   */
  protected roll(): number | null {
    return null
  }

  /**
   * Writes the round's start
   * @returns The command and its fields
   */
  protected opened(): readonly (string | number)[] {
    return ['round', this.ids[0], this.ids[1]]
  }

  /**
   * Finds whose hand won
   * @param first The first seat's hand
   * @param second The second seat's hand
   * @returns The seat, or null
   */
  protected winner(first: string, second: string): SeatIndex | null {
    if (first === second) return null
    if (second === 'off' || BEATS[first] === second) return 0
    if (first === 'off' || BEATS[second] === first) return 1

    return null
  }
}

/**
 * Referees the Shell Game
 * @class
 */
export class ShellGameReferee extends RoundsReferee {
  /**
   * Rounds won that win the match
   */
  protected readonly roundsToWin = 1

  /**
   * Draws that tie the match
   */
  protected readonly drawsToTie = 3

  /**
   * Reads a shell
   * @param text The shell sent
   * @returns The shell, or 0
   */
  protected choice(text: string | undefined): string {
    return String(Referee.whole(text, 1, 3) ?? 0)
  }

  /**
   * Rolls where the ball ends
   * @returns The shell
   */
  protected roll(): number | null {
    return 1 + Math.floor(this.random() * 3)
  }

  /**
   * Writes the round's start
   * @param roll The shell
   * @returns The command and its fields
   */
  protected opened(roll: number | null): readonly (string | number)[] {
    return ['round', this.ids[0], this.ids[1], roll ?? 0]
  }

  /**
   * Finds who found the ball
   * @param first The first seat's shell
   * @param second The second seat's shell
   * @param roll The shell with the ball
   * @returns The seat, or null
   */
  protected winner(
    first: string,
    second: string,
    roll: number | null,
  ): SeatIndex | null {
    const firstFound = first === String(roll)
    const secondFound = second === String(roll)
    if (firstFound === secondFound) return null

    return firstFound ? 0 : 1
  }
}
