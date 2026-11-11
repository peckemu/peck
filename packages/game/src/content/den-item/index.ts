import { Catalogue } from '#game/catalogue'

/**
 * A den item
 */
export type DenItemTemplate = {
  /**
   * The den item's pack id
   */
  readonly defId: number

  /**
   * The den item's name
   */
  readonly name?: string | null

  /**
   * The short name of its art
   */
  readonly abbrName: string

  /**
   * The den item's name string id
   */
  readonly nameStrId: number

  /**
   * Its special kind
   */
  readonly specialType: number

  /**
   * What the shop charges
   */
  readonly cost: number

  /**
   * The currency the shop charges in
   */
  readonly currencyType: number

  /**
   * The crafting cost
   */
  readonly combinedCost: string

  /**
   * The gems recycling it gives
   */
  readonly recycleValue: number

  /**
   * Whether only members can have it
   */
  readonly membersOnly: boolean

  /**
   * The den item's status
   */
  readonly status: number

  /**
   * The category it sorts into
   */
  readonly sortCat: number

  /**
   * The category of its type
   */
  readonly typeCat: number

  /**
   * Land, ocean or both
   */
  readonly enviroType: number

  /**
   * Its layer
   */
  readonly layer: number

  /**
   * The den item's flag
   */
  readonly flag: number

  /**
   * The opened minigame, or 0
   */
  readonly gameDefId: number

  /**
   * The opened list, or 0
   */
  readonly listId: number

  /**
   * A mannequin's animal, or 0
   */
  readonly mannequinAvatarDefId: number

  /**
   * A mannequin's category, or 0
   */
  readonly mannequinCatId: number

  /**
   * Its list, or 0
   */
  readonly parentArrayId: number

  /**
   * Its promotion kind
   */
  readonly promoType: number

  /**
   * How big it is drawn
   */
  readonly scalePercent: number

  /**
   * Its eco score
   */
  readonly ecoPower: number

  /**
   * When it goes on sale
   */
  readonly availableFrom?: Date | null

  /**
   * When it stops being on sale
   */
  readonly availableUntil?: Date | null
}

/**
 * The special type of a mannequin
 */
const MANNEQUIN = 4

/**
 * The den shop stand type
 */
const STAND = 5

/**
 * Every den item
 * @class
 */
export class DenItemCatalogue extends Catalogue<DenItemTemplate> {
  /**
   * Checks a den item is a mannequin
   * @param defId Its definition id
   * @returns Whether it is
   */
  public isMannequin(defId: number): boolean {
    const item = this.get(defId)

    return (
      item?.specialType === MANNEQUIN || (item?.mannequinAvatarDefId ?? 0) > 0
    )
  }

  /**
   * Checks a den item is a den shop stand
   * @param defId Its definition id
   * @returns Whether it is
   */
  public isStand(defId: number): boolean {
    return this.get(defId)?.specialType === STAND
  }
}
