import { Catalogue } from '#game/catalogue'

/**
 * The kinds of world item gift
 */
export const WorldItemGift = {
  /**
   * A den item
   */
  DenItem: 0,

  /**
   * Gems
   */
  Gems: 1,

  /**
   * Diamonds
   */
  Diamonds: 2,

  /**
   * A clothing item
   */
  Clothing: 3,
} as const

/**
 * A kind of world item gift
 */
export type WorldItemGift = (typeof WorldItemGift)[keyof typeof WorldItemGift]

/**
 * A world item
 */
export type WorldItemTemplate = {
  /**
   * The world item's id in the world items pack
   */
  readonly defId: number

  /**
   * The kind of gift
   */
  readonly giftType: number

  /**
   * The gift's definition id
   */
  readonly giftRefId: number

  /**
   * How much it gives
   */
  readonly amount: number

  /**
   * Its place in the room
   */
  readonly position: number

  /**
   * The user variable it is kept in
   */
  readonly userVarRefId: number

  /**
   * Its bit in the user variable
   */
  readonly uvIndex: number

  /**
   * When it comes out
   */
  readonly availableFrom?: Date | null

  /**
   * When it goes away
   */
  readonly availableUntil?: Date | null
}

/**
 * Every world item
 * @class
 */
export class WorldItemCatalogue extends Catalogue<WorldItemTemplate> {
  /**
   * Finds a world item that is out
   * @param defId The definition id
   * @param now The time
   * @returns The world item, or null
   */
  public out(defId: number, now: Date): WorldItemTemplate | null {
    const item = this.get(defId)
    if (!item) return null
    if (item.availableFrom && item.availableFrom > now) return null
    if (item.availableUntil && item.availableUntil < now) return null

    return item
  }
}
