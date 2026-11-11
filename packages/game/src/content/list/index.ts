import { Catalogue } from '#game/catalogue'

/**
 * A requestable generic list
 */
export type GenericListTemplate = {
  /**
   * The list id
   */
  readonly defId: number

  /**
   * Its body type
   */
  readonly type: number

  /**
   * What the whole list costs in diamonds
   */
  readonly diamondCost: number

  /**
   * Whether the list is bought whole
   */
  readonly diamondBundle: boolean

  /**
   * The ids in the list
   */
  readonly ids: readonly number[]
}

/**
 * Every generic list
 * @class
 */
export class GenericListCatalogue extends Catalogue<GenericListTemplate> {}
