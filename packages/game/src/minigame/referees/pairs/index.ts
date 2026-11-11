import {
  type Outcomes,
  Referee,
  type SeatIndex,
  type Told,
} from '#game/minigame/referee'

/**
 * The cards
 */
const CARDS = 16

/**
 * The pictures
 */
const PAIRS = CARDS / 2

/**
 * The emotes a player can show
 */
const EMOTES = 4

/**
 * The card commands
 */
const TURNS: readonly string[] = ['c1', 'c2']

/**
 * Referees Pairs
 * @class
 */
export class PairsReferee extends Referee {
  /**
   * The cards by place, or null
   */
  private cards: number[] | null = null

  /**
   * The places paired
   */
  private readonly taken = new Set<number>()

  /**
   * The pairs each seat found
   */
  private readonly found: [number, number] = [0, 0]

  /**
   * Whose turn it is
   */
  private turn: SeatIndex = 0

  /**
   * The cards turned this turn
   */
  private turned: number[] = []

  /**
   * The seats that saw the result, or null
   */
  private showing: Set<SeatIndex> | null = null

  /**
   * How it came out
   */
  private result: Outcomes | null = null

  /**
   * Deals the cards
   * @returns What to tell
   */
  public ready(): readonly Told[] {
    if (this.cards) return []

    const deck = Array.from<unknown, number>(
      { length: CARDS },
      (_, index) => index + 1,
    )
    for (let index = deck.length - 1; index > 0; index--) {
      const swap = Math.floor(this.random() * (index + 1))
      const card = deck[index] ?? 0
      deck[index] = deck[swap] ?? 0
      deck[swap] = card
    }

    this.cards = deck
    this.turn = Referee.either(this.random)
    const other = Referee.other(this.turn)

    return [
      Referee.both(
        'round',
        this.ids[this.turn],
        this.ids[other],
        CARDS,
        ...deck,
      ),
    ]
  }

  /**
   * Plays a turn
   * @param seat The seat it came from
   * @param data The command and its fields
   * @returns What to tell
   */
  public message(seat: SeatIndex, data: readonly string[]): readonly Told[] {
    const [command, field] = data
    if (!this.cards || this.result) return []

    if (command === 'emote') {
      const emote = Referee.whole(field, 1, EMOTES)
      return emote === null
        ? []
        : [Referee.to(Referee.other(seat), 'emote', emote)]
    }
    if (command === 'rp') return this.shown(seat)
    if (seat !== this.turn || this.showing) return []

    if (command === 'time') {
      this.turn = Referee.other(seat)
      this.showing = new Set<SeatIndex>()
      return [Referee.both('time')]
    }

    return this.flip(seat, command, field)
  }

  /**
   * How the game came out
   * @returns The outcomes, or null
   */
  public override outcome(): Outcomes | null {
    return this.result
  }

  /**
   * Notes a seat saw the result
   * @param seat The seat
   * @returns What to tell
   */
  private shown(seat: SeatIndex): readonly Told[] {
    if (!this.showing) return []

    this.showing.add(seat)
    if (this.showing.size < 2) return []

    this.showing = null
    this.turned = []

    return [Referee.both('nextround')]
  }

  /**
   * Turns a card
   * @param seat The seat turning it
   * @param command The card command
   * @param field The card's place
   * @returns What to tell
   */
  private flip(
    seat: SeatIndex,
    command: string | undefined,
    field: string | undefined,
  ): readonly Told[] {
    const which = TURNS.indexOf(command ?? '')
    if (which < 0 || which !== this.turned.length || !command) return []

    const place = Referee.whole(field, 0, CARDS - 1)
    if (place === null || this.taken.has(place)) return []
    if (this.turned.includes(place)) return []

    this.turned.push(place)
    const flipped = Referee.to(Referee.other(seat), command, place)

    const [first, second] = this.turned
    if (first === undefined || second === undefined) return [flipped]

    const matched = this.same(first, second)
    if (matched) {
      this.taken.add(first).add(second)
      this.found[seat]++
    }

    if (this.taken.size === CARDS) return [flipped, this.over()]

    if (!matched) this.turn = Referee.other(seat)
    this.showing = new Set<SeatIndex>()

    return [flipped, Referee.both('results', 0, Referee.flag(matched))]
  }

  /**
   * Ends the match
   * @returns What to tell
   */
  private over(): Told {
    const [mine, theirs] = this.found

    if (mine === theirs) {
      this.result = ['tied', 'tied']
      return Referee.both('results', 1, 0)
    }

    const winner: SeatIndex = mine > theirs ? 0 : 1
    this.result = Referee.wonBy(winner)

    return Referee.both('results', 1, this.ids[winner])
  }

  /**
   * Checks two cards match
   * @param first The first place
   * @param second The second place
   * @returns Whether they do
   */
  private same(first: number, second: number): boolean {
    const cards = this.cards ?? []

    return (cards[first] ?? 0) % PAIRS === (cards[second] ?? -1) % PAIRS
  }
}
