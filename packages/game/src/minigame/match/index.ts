import {
  type Outcome,
  type Outcomes,
  type Referee,
  type SeatIndex,
} from '#game/minigame/referee'
import {
  BowlingReferee,
  FourGemsReferee,
  MarblesReferee,
  PairsReferee,
  RockPaperScissorsReferee,
  ScoopedReferee,
  ShellGameReferee,
  TicTacToeReferee,
} from '#game/minigame/referees'

/**
 * A referee's class
 */
export type RefereeType = new (
  ids: readonly [number, number],
  random: () => number,
) => Referee

/**
 * The gems a two player game gives
 */
export type MatchGems = Readonly<Record<Outcome, number>>

/**
 * The referees by game movie
 */
const REFEREES: ReadonlyMap<string, RefereeType> = new Map<string, RefereeType>(
  [
    ['PVP_TicTacToe', TicTacToeReferee],
    ['PVP_ConnectFour', FourGemsReferee],
    ['PVP_RockPaperScissor', RockPaperScissorsReferee],
    ['PVP_ShellGame', ShellGameReferee],
    ['PVP_Memory', PairsReferee],
    ['PVP_Bowling', BowlingReferee],
    ['PVP_Marbles', MarblesReferee],
    ['PVP_Scooped', ScoopedReferee],
  ],
)

/**
 * The result the other seat had
 */
const OTHER_SIDE: Readonly<Record<Outcome, Outcome>> = {
  won: 'lost',
  lost: 'won',
  tied: 'tied',
}

/**
 * A two player game being played
 * @class
 */
export class Match {
  /**
   * The players' session ids
   */
  public readonly ids: readonly [number, number]

  /**
   * The game's referee
   */
  public readonly referee: Referee

  /**
   * The seats that are ready
   */
  private readonly readied = new Set<SeatIndex>()

  /**
   * The seats given their award
   */
  private readonly awarded = new Set<SeatIndex>()

  /**
   * The results the seats claimed
   */
  private readonly claims = new Map<SeatIndex, Outcome>()

  /**
   * The seat that left before the end
   */
  private quitter: SeatIndex | null = null

  /**
   * Creates a match
   * @param ids The players' session ids
   * @param referee The game's referee
   */
  public constructor(ids: readonly [number, number], referee: Referee) {
    this.ids = ids
    this.referee = referee
  }

  /**
   * Whether a seat left before the end
   */
  public get abandoned(): boolean {
    return this.quitter !== null
  }

  /**
   * Whether the match has its result
   */
  public get decided(): boolean {
    return this.referee.outcome() !== null || this.claims.size > 0
  }

  /**
   * Starts a match of a game
   * @param swfName The game movie
   * @param ids The players' session ids
   * @param random Rolls a number from 0 to 1
   * @returns The match, or null
   */
  public static of(
    swfName: string,
    ids: readonly [number, number],
    random: () => number = Math.random,
  ): Match | null {
    const type = REFEREES.get(swfName)

    return type ? new Match(ids, new type(ids, random)) : null
  }

  /**
   * Checks a game is refereed
   * @param swfName The game movie
   * @returns Whether it is
   */
  public static refereed(swfName: string): boolean {
    return REFEREES.has(swfName)
  }

  /**
   * Finds a player's seat
   * @param userId Their session id
   * @returns The seat, or null
   */
  public seatOf(userId: number): SeatIndex | null {
    const index = this.ids.indexOf(userId)

    return index === 0 || index === 1 ? index : null
  }

  /**
   * Marks a seat ready
   * @param seat The seat
   * @returns Whether both are
   */
  public ready(seat: SeatIndex): boolean {
    this.readied.add(seat)
    if (this.readied.size < 2) return false

    this.readied.clear()
    return true
  }

  /**
   * Notes a seat left
   * @param seat The seat
   */
  public left(seat: SeatIndex): void {
    if (!this.decided && this.quitter === null) this.quitter = seat
  }

  /**
   * Finds how the match came out for a seat
   * @param seat The seat
   * @returns The outcome, or null
   */
  public outcomeOf(seat: SeatIndex): Outcome | null {
    if (this.quitter !== null && this.quitter !== seat) return 'won'

    const outcomes: Outcomes | null = this.referee.outcome()
    return outcomes ? outcomes[seat] : null
  }

  /**
   * Checks a gem award fits the result
   * @param seat The seat claiming it
   * @param amount The gems claimed
   * @param gems The gems for each result
   * @returns Whether it does
   */
  public award(seat: SeatIndex, amount: number, gems: MatchGems): boolean {
    if (this.awarded.has(seat)) return false

    const outcome = this.outcomeOf(seat)
    if (outcome !== null && amount !== gems[outcome]) return false

    if (outcome === null) {
      if (!this.referee.claimsResult) return false

      const claimed = (['won', 'tied', 'lost'] as const).find(
        (each) => gems[each] === amount,
      )
      if (!claimed) return false

      const other = this.claims.get(seat === 0 ? 1 : 0)
      if (other && OTHER_SIDE[other] !== claimed) return false

      this.claims.set(seat, claimed)
    }

    this.awarded.add(seat)
    return true
  }
}
