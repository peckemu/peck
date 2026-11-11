import { type DenItemCatalogue } from '#game/content/den-item'
import { type OwnedDenItem } from '#game/den'

/**
 * The wind turbine
 */
export const WIND_TURBINE = 4541

/**
 * The solar panel
 */
export const SOLAR_PANEL = 4540

/**
 * The eco item special type
 */
const ECO_ITEM = 7

/**
 * Seconds per eco credit
 */
export const ECO_CREDIT_SECONDS = 360

/**
 * The most unredeemed eco credits
 */
export const ECO_CREDIT_LIMIT = 240

/**
 * An eco item's switch
 */
export const EcoSwitch = {
  /**
   * Switched off
   */
  Off: 0,

  /**
   * Switched on
   */
  On: 1,

  /**
   * Switched on without power
   */
  Offline: 2,
} as const

/**
 * An eco item's switch
 */
export type EcoSwitch = (typeof EcoSwitch)[keyof typeof EcoSwitch]

/**
 * An eco item's state
 */
export type EcoConsumer = {
  /**
   * Its place in the player's den items
   */
  readonly invIdx: number

  /**
   * Its switch
   */
  readonly stateId: EcoSwitch
}

/**
 * A den's eco power
 */
export type EcoPower = {
  /**
   * The placed wind turbines
   */
  readonly turbines: number

  /**
   * The placed solar panels
   */
  readonly solarPanels: number

  /**
   * The power made
   */
  readonly generation: number

  /**
   * The power drawn
   */
  readonly consumption: number

  /**
   * The eco items
   */
  readonly consumers: readonly EcoConsumer[]
}

/**
 * An eco credit meter
 */
export type EcoMeter = {
  /**
   * Eco credits earned but not yet redeemed
   */
  readonly unredeemed: number

  /**
   * When eco credits were last earned
   */
  readonly accruedAt: Date | null
}

/**
 * An eco credit meter brought up to date
 */
export type EcoAccrual = EcoMeter & {
  /**
   * Seconds to the next eco credit
   */
  readonly secondsToNext: number
}

/**
 * How a den's eco system works
 * @class
 */
export class EcoRules {
  /**
   * Every den item
   */
  private readonly denItems: DenItemCatalogue

  /**
   * Creates the rules
   * @param denItems Every den item
   */
  public constructor(denItems: DenItemCatalogue) {
    this.denItems = denItems
  }

  /**
   * Checks a den item draws eco power
   * @param defId Its definition id
   * @returns Whether it does
   */
  public consumes(defId: number): boolean {
    return this.denItems.get(defId)?.specialType === ECO_ITEM
  }

  /**
   * Works out a den's eco power
   * @param items The owner's den items
   * @returns The power
   */
  public power(items: readonly OwnedDenItem[]): EcoPower {
    const placed = items
      .filter(({ categoryId }) => categoryId !== 0)
      .sort((a, b) => a.invIdx - b.invIdx)

    const turbines = placed.filter(({ defId }) => defId === WIND_TURBINE)
    const panels = placed.filter(({ defId }) => defId === SOLAR_PANEL)
    const generation = [...turbines, ...panels].reduce(
      (sum, { defId }) => sum + this.ecoPower(defId),
      0,
    )

    let consumption = 0
    const consumers = placed
      .filter(({ defId }) => this.consumes(defId))
      .map(({ invIdx, defId, ecoConsumerState }): EcoConsumer => {
        if ((ecoConsumerState ?? EcoSwitch.Off) === EcoSwitch.Off) {
          return { invIdx, stateId: EcoSwitch.Off }
        }

        const power = this.ecoPower(defId)
        if (consumption + power > generation) {
          return { invIdx, stateId: EcoSwitch.Offline }
        }

        consumption += power
        return { invIdx, stateId: EcoSwitch.On }
      })

    return {
      turbines: turbines.length,
      solarPanels: panels.length,
      generation,
      consumption,
      consumers,
    }
  }

  /**
   * Brings an eco credit meter up to date
   * @param meter The meter
   * @param generating Whether the den makes power
   * @param now The time
   * @returns The meter
   */
  public static accrue(
    meter: EcoMeter,
    generating: boolean,
    now: Date,
  ): EcoAccrual {
    const { unredeemed, accruedAt } = meter
    if (!generating) return { unredeemed, accruedAt: null, secondsToNext: 0 }

    const full = unredeemed >= ECO_CREDIT_LIMIT
    if (!accruedAt || full) {
      return {
        unredeemed,
        accruedAt: now,
        secondsToNext: full ? 0 : ECO_CREDIT_SECONDS,
      }
    }

    const step = ECO_CREDIT_SECONDS * 1000
    const since = now.getTime() - accruedAt.getTime()
    const earned = Math.max(
      Math.min(Math.floor(since / step), ECO_CREDIT_LIMIT - unredeemed),
      0,
    )
    const total = unredeemed + earned

    if (total >= ECO_CREDIT_LIMIT) {
      return { unredeemed: total, accruedAt: now, secondsToNext: 0 }
    }

    const counted = new Date(accruedAt.getTime() + earned * step)
    const waited = Math.floor((now.getTime() - counted.getTime()) / 1000)

    return {
      unredeemed: total,
      accruedAt: counted,
      secondsToNext: Math.max(ECO_CREDIT_SECONDS - waited, 1),
    }
  }

  /**
   * Finds a den item's eco power
   * @param defId Its definition id
   * @returns The power
   */
  private ecoPower(defId: number): number {
    return Math.max(this.denItems.get(defId)?.ecoPower ?? 0, 0)
  }
}
