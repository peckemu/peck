import { Catalogue } from '#game/catalogue'

/**
 * A clothing item
 */
export type ItemTemplate = {
  /**
   * The item's id in the item pack
   */
  readonly defId: number

  /**
   * The item's name
   */
  readonly name?: string | null

  /**
   * The accessory the item draws
   */
  readonly accId: number

  /**
   * The item's layer
   */
  readonly layerId: number

  /**
   * The item's name string id
   */
  readonly titleStrId: number

  /**
   * The kind of item
   */
  readonly type: number

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
   * The item's status
   */
  readonly status: number

  /**
   * Whether it can be gifted
   */
  readonly giftable: boolean

  /**
   * Whether only members can have it
   */
  readonly membersOnly: boolean

  /**
   * Land 0, ocean 1 or both 2
   */
  readonly enviroType: number

  /**
   * The animals it fits
   */
  readonly avatarUseFlags: number

  /**
   * The colours it comes in
   */
  readonly colors: readonly number[]

  /**
   * Its defence in adventures
   */
  readonly defense: number

  /**
   * Its attack in adventures
   */
  readonly attack: number

  /**
   * The media its attack plays
   */
  readonly attackMediaRefId: number

  /**
   * The kind of attack
   */
  readonly combatType: number

  /**
   * The kind of modifier
   */
  readonly modifierType: number

  /**
   * How much the modifier gives
   */
  readonly modifierValue: number

  /**
   * The chance of a critical hit
   */
  readonly criticalHit: number

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
 * Every clothing item
 * @class
 */
export class ItemCatalogue extends Catalogue<ItemTemplate> {}
