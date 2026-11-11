import { Catalogue } from '#game/catalogue'

/**
 * A den
 */
export type DenRoomTemplate = {
  /**
   * The den's pack id
   */
  readonly defId: number

  /**
   * The den's name
   */
  readonly name?: string | null

  /**
   * The den's name string id
   */
  readonly titleStrId: number

  /**
   * The den's room
   */
  readonly roomDefId: number

  /**
   * Land 0 or ocean 1
   */
  readonly enviroType: number

  /**
   * What the den shop charges
   */
  readonly cost: number

  /**
   * The den's picture
   */
  readonly mediaRef: number

  /**
   * The den's icon
   */
  readonly iconMediaRef: number

  /**
   * The den's status in the shop
   */
  readonly status: number

  /**
   * Whether only members can have it
   */
  readonly membersOnly: boolean

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
 * Every den
 * @class
 */
export class DenRoomCatalogue extends Catalogue<DenRoomTemplate> {}
