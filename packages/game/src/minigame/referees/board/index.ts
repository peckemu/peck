import {
  type Outcomes,
  Referee,
  type SeatIndex,
  type Told,
} from '#game/minigame/referee'

/**
 * The ways a line runs
 */
const LINES: readonly (readonly [number, number])[] = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
]

/**
 * A place on the board
 */
export type Cell = {
  /**
   * The column
   */
  readonly x: number

  /**
   * The row
   */
  readonly y: number
}

/**
 * A mark played
 */
export type Mark = Cell & {
  /**
   * Who played it
   */
  readonly seat: SeatIndex

  /**
   * Whether it won
   */
  readonly won: boolean

  /**
   * Whether it filled the board
   */
  readonly tied: boolean

  /**
   * Whose turn is next
   */
  readonly turn: SeatIndex
}

/**
 * Referees a board game of turns
 * @class
 */
export abstract class BoardReferee extends Referee {
  /**
   * The board's width
   */
  protected abstract readonly width: number

  /**
   * The board's height
   */
  protected abstract readonly height: number

  /**
   * How many in a row win
   */
  protected abstract readonly connect: number

  /**
   * The marks by place, or null
   */
  private board: (SeatIndex | null)[] | null = null

  /**
   * Whose turn it is
   */
  private turn: SeatIndex = 0

  /**
   * How many marks are down
   */
  private marks = 0

  /**
   * How it came out
   */
  private result: Outcomes | null = null

  /**
   * Opens the board
   * @returns What to tell
   */
  public ready(): readonly Told[] {
    this.board = Array.from<SeatIndex | null>({
      length: this.width * this.height,
    }).fill(null)
    this.marks = 0
    this.result = null
    this.turn = Referee.either(this.random)

    return [Referee.both('round', this.turn, this.ids[0], this.ids[1])]
  }

  /**
   * Plays a mark
   * @param seat The seat it came from
   * @param data The command and its fields
   * @returns What to tell
   */
  public message(seat: SeatIndex, data: readonly string[]): readonly Told[] {
    const [command, ...fields] = data
    if (!this.board || this.result || seat !== this.turn) return []

    if (command === 'time') {
      this.turn = Referee.other(seat)
      return [Referee.both('invalid', this.turn)]
    }
    if (command !== 'mark') return []

    const cell = this.place(fields)
    if (!cell) return [Referee.to(seat, 'invalid', this.turn)]

    this.board[cell.y * this.width + cell.x] = seat
    this.marks++

    const won = this.lineThrough(cell, seat)
    const tied = !won && this.marks === this.width * this.height
    if (won) this.result = Referee.wonBy(seat)
    else if (tied) this.result = ['tied', 'tied']
    else this.turn = Referee.other(seat)

    return [
      Referee.both(
        ...this.marked({ ...cell, seat, won, tied, turn: this.turn }),
      ),
    ]
  }

  /**
   * How the game came out
   * @returns The outcomes, or null
   */
  public override outcome(): Outcomes | null {
    return this.result
  }

  /**
   * Checks a place is taken
   * @param x The column
   * @param y The row
   * @returns Whether it is
   */
  protected taken(x: number, y: number): boolean {
    return this.at(x, y) !== null
  }

  /**
   * Finds where a mark goes
   * @param fields The mark's fields
   * @returns The place, or null
   */
  protected abstract place(fields: readonly string[]): Cell | null

  /**
   * Writes a mark
   * @param mark The mark
   * @returns The command and its fields
   */
  protected abstract marked(mark: Mark): readonly (string | number)[]

  /**
   * Reads a place on the board
   * @param x The column
   * @param y The row
   * @returns The seat there, or null
   */
  private at(x: number, y: number): SeatIndex | null {
    const outside = x < 0 || y < 0 || x >= this.width || y >= this.height
    if (outside || !this.board) return null

    return this.board[y * this.width + x] ?? null
  }

  /**
   * Checks a mark makes a line
   * @param cell The mark's place
   * @param seat Who played it
   * @returns Whether it does
   */
  private lineThrough(cell: Cell, seat: SeatIndex): boolean {
    return LINES.some(([dx, dy]) => {
      let run = 1

      for (const sign of [1, -1]) {
        let step = 1
        while (
          this.at(cell.x + sign * step * dx, cell.y + sign * step * dy) === seat
        ) {
          run++
          step++
        }
      }

      return run >= this.connect
    })
  }
}

/**
 * Referees Tic-Tac-Toe
 * @class
 */
export class TicTacToeReferee extends BoardReferee {
  /**
   * The board's width
   */
  protected readonly width = 3

  /**
   * The board's height
   */
  protected readonly height = 3

  /**
   * How many in a row win
   */
  protected readonly connect = 3

  /**
   * Finds the space marked
   * @param fields The mark's fields
   * @returns The place, or null
   */
  protected place(fields: readonly string[]): Cell | null {
    const [column, row] = fields
    const x = Referee.whole(column, 0, 2)
    const y = Referee.whole(row, 0, 2)
    if (x === null || y === null || this.taken(x, y)) return null

    return { x, y }
  }

  /**
   * Writes a mark
   * @param mark The mark
   * @returns The command and its fields
   */
  protected marked(mark: Mark): readonly (string | number)[] {
    return [
      'mark',
      mark.seat,
      mark.x,
      mark.y,
      Referee.flag(mark.won),
      Referee.flag(mark.tied),
      mark.turn,
    ]
  }
}

/**
 * Referees Four Gems
 * @class
 */
export class FourGemsReferee extends BoardReferee {
  /**
   * The board's width
   */
  protected readonly width = 7

  /**
   * The board's height
   */
  protected readonly height = 6

  /**
   * How many in a row win
   */
  protected readonly connect = 4

  /**
   * Finds where the gem drops
   * @param fields The drop's fields
   * @returns The place, or null
   */
  protected place(fields: readonly string[]): Cell | null {
    const [column] = fields
    const x = Referee.whole(column, 0, this.width - 1)
    if (x === null) return null

    let y = 0
    while (y < this.height && this.taken(x, y)) y++

    return y === this.height ? null : { x, y }
  }

  /**
   * Writes a drop
   * @param mark The drop
   * @returns The command and its fields
   */
  protected marked(mark: Mark): readonly (string | number)[] {
    return [
      'mark',
      mark.seat,
      mark.x,
      Referee.flag(mark.won),
      Referee.flag(mark.tied),
      mark.turn,
    ]
  }
}
