import { Referee, type SeatIndex, type Told } from '#game/minigame/referee'

/**
 * The emotes a player can show
 */
const EMOTES = 4

/**
 * Referees Bowling
 * @class
 */
export class BowlingReferee extends Referee {
  /**
   * Whether the players claim the result
   */
  public override readonly claimsResult: boolean = true

  /**
   * Whether the game started
   */
  private started = false

  /**
   * Whether the turn's ball was rolled
   */
  private rolled = false

  /**
   * The seats that counted the ball
   */
  private readonly counted = new Set<SeatIndex>()

  /**
   * Picks who bowls first
   * @returns What to tell
   */
  public ready(): readonly Told[] {
    if (this.started) return []

    this.started = true
    const first = Referee.either(this.random)

    return [
      Referee.both('round', this.ids[first], this.ids[Referee.other(first)]),
    ]
  }

  /**
   * Passes a turn on
   * @param seat The seat it came from
   * @param data The command and its fields
   * @returns What to tell
   */
  public message(seat: SeatIndex, data: readonly string[]): readonly Told[] {
    const [command, ...fields] = data
    if (!this.started) return []

    switch (command) {
      case 'emote':
        return this.emote(seat, fields[0])
      case 'time':
        if (this.rolled) return []
        this.rolled = true
        return [Referee.both('time')]
      case 'ball':
        return this.ball(seat, fields)
      case 'rp':
        return this.count(seat)
      default:
        return []
    }
  }

  /**
   * Shows an emote to the other seat
   * @param seat The seat it came from
   * @param field The emote
   * @returns What to tell
   */
  private emote(seat: SeatIndex, field: string | undefined): readonly Told[] {
    const emote = Referee.whole(field, 1, EMOTES)

    return emote === null
      ? []
      : [Referee.to(Referee.other(seat), 'emote', emote)]
  }

  /**
   * Rolls a ball on the other lane
   * @param seat The seat it came from
   * @param fields The ball's fields
   * @returns What to tell
   */
  private ball(seat: SeatIndex, fields: readonly string[]): readonly Told[] {
    if (this.rolled) return []

    const [angle, x, y] = fields.map((field) => Referee.decimal(field))
    if (!angle || !x || !y) return []

    this.rolled = true

    return [Referee.to(Referee.other(seat), 'ball', angle, x, y)]
  }

  /**
   * Notes a seat counted the ball
   * @param seat The seat
   * @returns What to tell
   */
  private count(seat: SeatIndex): readonly Told[] {
    if (!this.rolled) return []

    this.counted.add(seat)
    if (this.counted.size < 2) return []

    this.counted.clear()
    this.rolled = false

    return [Referee.both('nextround')]
  }
}
