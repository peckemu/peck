import { type Currency, JamaaCalendar } from '@peck/shared'

/**
 * The daily spin's prizes
 */
export const SpinPrize = {
  /**
   * 25 gems
   */
  Gems25: 0,

  /**
   * 50 gems
   */
  Gems50: 1,

  /**
   * 75 gems
   */
  Gems75: 2,

  /**
   * 100 gems
   */
  Gems100: 3,

  /**
   * 500 gems
   */
  Gems500: 4,

  /**
   * One diamond
   */
  Diamond: 5,

  /**
   * A present
   */
  Gift: 6,

  /**
   * Two diamonds
   */
  Diamonds2: 7,
} as const

export type SpinPrize = (typeof SpinPrize)[keyof typeof SpinPrize]

/**
 * A spin wheel
 */
export type SpinWheel = 'gems' | 'member'

/**
 * The daily gem bonus
 */
export type GemBonus = {
  /**
   * The last prize
   */
  readonly prize: number

  /**
   * The streak bonus
   */
  readonly multiplier: number

  /**
   * The Jamaa day of the spin
   */
  readonly day: number
}

/**
 * What a prize pays
 */
export type SpinPayout = {
  /**
   * The currency
   */
  readonly currency: Currency

  /**
   * How much
   */
  readonly amount: number
}

/**
 * A prize's chance
 */
type Weight = {
  /**
   * The prize
   */
  readonly prize: SpinPrize

  /**
   * Its share in hundredths
   */
  readonly weight: number
}

/**
 * Each wheel's prize chances
 */
const WEIGHTS: Readonly<Record<SpinWheel, readonly Weight[]>> = {
  gems: [
    { prize: SpinPrize.Gems25, weight: 30 },
    { prize: SpinPrize.Gems50, weight: 25 },
    { prize: SpinPrize.Gems75, weight: 18 },
    { prize: SpinPrize.Gems100, weight: 18 },
    { prize: SpinPrize.Gems500, weight: 2 },
    { prize: SpinPrize.Diamond, weight: 4 },
    { prize: SpinPrize.Gift, weight: 3 },
  ],
  member: [
    { prize: SpinPrize.Diamond, weight: 80 },
    { prize: SpinPrize.Diamonds2, weight: 12 },
    { prize: SpinPrize.Gift, weight: 8 },
  ],
}

/**
 * The currency prizes
 */
const PAYOUTS: ReadonlyMap<number, SpinPayout> = new Map<number, SpinPayout>([
  [SpinPrize.Gems25, { currency: 'gems', amount: 25 }],
  [SpinPrize.Gems50, { currency: 'gems', amount: 50 }],
  [SpinPrize.Gems75, { currency: 'gems', amount: 75 }],
  [SpinPrize.Gems100, { currency: 'gems', amount: 100 }],
  [SpinPrize.Gems500, { currency: 'gems', amount: 500 }],
  [SpinPrize.Diamond, { currency: 'diamonds', amount: 1 }],
  [SpinPrize.Diamonds2, { currency: 'diamonds', amount: 2 }],
])

/**
 * The highest streak bonus
 */
const MOST_MULTIPLIER = 3

/**
 * The never spun value
 */
const NEVER = -1

/**
 * The daily spin
 * @class
 */
export class DailySpin {
  /**
   * Draws a number below one
   */
  private readonly random: () => number

  /**
   * Reads the time
   */
  private readonly now: () => number

  /**
   * Creates the daily spin
   * @param random Draws a number below one
   * @param now Reads the time
   */
  public constructor(
    random: () => number = Math.random,
    now: () => number = Date.now,
  ) {
    this.random = random
    this.now = now
  }

  /**
   * Finds today's Jamaa day
   * @returns The day
   */
  public today(): number {
    return JamaaCalendar.dayOf(this.now())
  }

  /**
   * Draws a prize
   * @param wheel The wheel
   * @param canGift Whether a present can be given
   * @returns The prize
   */
  public draw(wheel: SpinWheel, canGift: boolean): SpinPrize {
    const weights = WEIGHTS[wheel].filter(
      ({ prize }) => canGift || prize !== SpinPrize.Gift,
    )
    const total = weights.reduce((sum, { weight }) => sum + weight, 0)

    let left = Math.min(Math.max(this.random(), 0), 0.999999) * total
    for (const { prize, weight } of weights) {
      if (left < weight) return prize
      left -= weight
    }

    return weights[weights.length - 1]?.prize ?? SpinPrize.Gems25
  }

  /**
   * Picks one of several choices
   * @param choices The choices
   * @returns The choice, or null
   */
  public pick<T>(choices: readonly T[]): T | null {
    const index = Math.floor(this.random() * choices.length)

    return choices[Math.min(index, choices.length - 1)] ?? null
  }

  /**
   * Finds a player's wheel
   * @param member Whether they are a member
   * @returns The wheel
   */
  public static wheelOf(member: boolean): SpinWheel {
    return member ? 'member' : 'gems'
  }

  /**
   * Finds why a player can't spin
   * @param last The last spin
   * @param today The Jamaa day
   * @returns The reason, or null
   */
  public static refusal(last: GemBonus | null, today: number): string | null {
    if (last && last.day >= today) return 'already spun today'

    return null
  }

  /**
   * Works out the streak bonus
   * @param last The last spin
   * @param today The Jamaa day
   * @returns The bonus
   */
  public static multiplier(last: GemBonus | null, today: number): number {
    if (last?.day !== today - 1) return 1

    return Math.min(Math.max(last.multiplier, 0) + 1, MOST_MULTIPLIER)
  }

  /**
   * Finds what a prize pays
   * @param prize The prize
   * @param multiplier The streak bonus
   * @returns The payout, or null
   */
  public static payout(prize: number, multiplier: number): SpinPayout | null {
    const payout = PAYOUTS.get(prize)
    if (!payout) return null

    return { currency: payout.currency, amount: payout.amount * multiplier }
  }

  /**
   * Packs the daily gem bonus
   * @param bonus The bonus
   * @returns The variable's value
   */
  public static pack(bonus: GemBonus): number {
    return (
      (bonus.prize & 0xff) * 0x1000000 +
      ((bonus.multiplier & 0xff) << 16) +
      (bonus.day & 0xffff)
    )
  }

  /**
   * Reads the daily gem bonus
   * @param value The variable's value
   * @returns The bonus, or null
   */
  public static read(value: number | undefined): GemBonus | null {
    if (value === undefined || value === NEVER || !Number.isFinite(value)) {
      return null
    }

    const bits = value >>> 0

    return {
      prize: bits >>> 24,
      multiplier: (bits >>> 16) & 0xff,
      day: bits & 0xffff,
    }
  }
}
