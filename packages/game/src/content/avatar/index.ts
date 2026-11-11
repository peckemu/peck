import { Catalogue } from '#game/catalogue'

/**
 * An animal
 */
export type AvatarTemplate = {
  /**
   * The animal's id in the avatar pack
   */
  readonly defId: number

  /**
   * The animal's name
   */
  readonly name?: string | null

  /**
   * The animal's name string id
   */
  readonly titleStrId: number

  /**
   * The default colours
   */
  readonly colors: readonly number[]

  /**
   * Its eyes
   */
  readonly eyesDefId: number

  /**
   * Its pattern, or 0
   */
  readonly patternDefId: number

  /**
   * Whether only members can be it
   */
  readonly membersOnly: boolean

  /**
   * Land, ocean or both
   */
  readonly enviroTypeFlags: number

  /**
   * The cost in gems
   */
  readonly cost: number

  /**
   * Whether it can be had now
   */
  readonly availability: number

  /**
   * The animal's status
   */
  readonly status: number
}

/**
 * Every animal
 * @class
 */
export class AvatarCatalogue extends Catalogue<AvatarTemplate> {}
