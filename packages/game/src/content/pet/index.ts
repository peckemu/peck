import { Catalogue } from '#game/catalogue'

/**
 * A pet
 */
export type PetTemplate = {
  /**
   * The pet's id in the pet pack
   */
  readonly defId: number

  /**
   * The pet's name
   */
  readonly name?: string | null

  /**
   * The pet's name string id
   */
  readonly titleStrId: number

  /**
   * The pet's art
   */
  readonly mediaRefId: number

  /**
   * Its pet kind
   */
  readonly type: number

  /**
   * Whether only members can have it
   */
  readonly membersOnly: boolean

  /**
   * What the shop charges
   */
  readonly cost: number

  /**
   * The pet's status
   */
  readonly status: number

  /**
   * Its toys
   */
  readonly toyListId: number

  /**
   * The list of what it eats
   */
  readonly foodListId: number

  /**
   * Whether it is a reward
   */
  readonly reward: boolean

  /**
   * Whether it hatches from an egg
   */
  readonly egg: boolean

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
 * Every pet
 * @class
 */
export class PetCatalogue extends Catalogue<PetTemplate> {}
