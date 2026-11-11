import { Referee, type SeatIndex, type Told } from '#game/minigame/referee'

/**
 * The marble layouts
 */
const PATTERNS = 14

/**
 * The farthest aim
 */
const FARTHEST = 10_000

/**
 * Referees Marbles
 * @class
 */
export class MarblesReferee extends Referee {
  /**
   * Whether the players claim the result
   */
  public override readonly claimsResult: boolean = true

  /**
   * The ring's layout
   */
  private readonly layout: number = 1 + Math.floor(this.random() * PATTERNS)

  /**
   * Whose turn it is, or null
   */
  private turn: SeatIndex | null = null

  /**
   * Whether the turn's shot was taken
   */
  private shot = false

  /**
   * The seats whose marbles stopped
   */
  private readonly stopped = new Set<SeatIndex>()

  /**
   * Picks who shoots first
   * @returns What to tell
   */
  public ready(): readonly Told[] {
    if (this.turn !== null) return []

    this.turn = Referee.either(this.random)

    return [Referee.both('start', this.turn)]
  }

  /**
   * Passes a shot on
   * @param seat The seat it came from
   * @param data The command and its fields
   * @returns What to tell
   */
  public message(seat: SeatIndex, data: readonly string[]): readonly Told[] {
    const [command, ...fields] = data
    if (this.turn === null) return []

    switch (command) {
      case 'pos':
        return this.aim(seat, fields)
      case 'shoot':
        return this.shoot(seat, fields)
      case 'endTurn':
        return this.end(seat)
      default:
        return []
    }
  }

  /**
   * The ring's layout
   * @returns The layout
   */
  public override pattern(): number {
    return this.layout
  }

  /**
   * Shows the shooter's aim
   * @param seat The seat it came from
   * @param fields The aim's fields
   * @returns What to tell
   */
  private aim(seat: SeatIndex, fields: readonly string[]): readonly Told[] {
    if (seat !== this.turn || this.shot) return []

    const [x, y] = fields.map((field) =>
      Referee.whole(field, -FARTHEST, FARTHEST),
    )
    if (x === undefined || y === undefined || x === null || y === null) {
      return []
    }

    return [Referee.to(Referee.other(seat), 'pos', x, y)]
  }

  /**
   * Rolls the shot on the other ring
   * @param seat The seat it came from
   * @param fields The shot's fields
   * @returns What to tell
   */
  private shoot(seat: SeatIndex, fields: readonly string[]): readonly Told[] {
    if (seat !== this.turn || this.shot) return []

    const [x, y, shotX, shotY] = fields.map((field) => Referee.decimal(field))
    if (!x || !y || !shotX || !shotY) return []

    this.shot = true

    return [Referee.to(Referee.other(seat), 'shoot', x, y, shotX, shotY)]
  }

  /**
   * Notes a seat's marbles stopped
   * @param seat The seat
   * @returns What to tell
   */
  private end(seat: SeatIndex): readonly Told[] {
    if (!this.shot || this.turn === null) return []

    this.stopped.add(seat)
    if (this.stopped.size < 2) return []

    this.stopped.clear()
    this.shot = false
    this.turn = Referee.other(this.turn)

    return [Referee.both('endTurn')]
  }
}
