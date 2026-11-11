import { GameError } from '#game/error'
import { type Item } from '#game/item'

/**
 * An avatar's three colours
 */
export type AvatarColors = readonly [number, number, number]

/**
 * How an avatar is made
 */
export type AvatarOptions = {
  /**
   * Its slot
   */
  readonly avInvId: number

  /**
   * Its id among the player's avatars
   */
  readonly perUserAvId: number

  /**
   * The animal it is
   */
  readonly avTypeId: number

  /**
   * Its name
   */
  readonly avName: string

  /**
   * The custom animal, or -1
   */
  readonly customAvId?: number

  /**
   * Its first colour
   */
  readonly color1?: number

  /**
   * Its second colour
   */
  readonly color2?: number

  /**
   * Its third colour
   */
  readonly color3?: number

  /**
   * Its adventure level
   */
  readonly questLevel?: number

  /**
   * The eyes it wears
   */
  readonly eyesDefId?: number

  /**
   * Its pattern, or 0
   */
  readonly patternDefId?: number

  /**
   * The land pet, or 0
   */
  readonly landPetInvIdx?: number

  /**
   * The ocean pet, or 0
   */
  readonly oceanPetInvIdx?: number
}

/**
 * One of a player's avatars
 * @class
 */
export class Avatar {
  /**
   * Its slot
   */
  public readonly invId: number

  /**
   * Its id among the player's avatars
   */
  public readonly perUserId: number

  /**
   * The animal it is
   */
  public readonly typeId: number

  /**
   * The custom animal, or -1
   */
  public customId: number

  /**
   * Its name
   */
  public name: string

  /**
   * Its colours
   */
  public colors: AvatarColors

  /**
   * Its adventure level
   */
  public questLevel: number

  /**
   * The eyes it wears
   */
  public eyesDefId: number

  /**
   * Its pattern, or 0
   */
  public patternDefId: number

  /**
   * The land pet, or 0
   */
  public landPetInvIdx: number

  /**
   * The ocean pet, or 0
   */
  public oceanPetInvIdx: number

  /**
   * Creates an avatar
   * @param options The options
   */
  public constructor(options: AvatarOptions) {
    this.invId = options.avInvId
    this.perUserId = options.perUserAvId
    this.typeId = options.avTypeId
    this.name = options.avName
    this.customId = options.customAvId ?? -1
    this.colors = [
      options.color1 ?? 0,
      options.color2 ?? 0,
      options.color3 ?? 0,
    ]
    this.questLevel = options.questLevel ?? 0
    this.eyesDefId = options.eyesDefId ?? 0
    this.patternDefId = options.patternDefId ?? 0
    this.landPetInvIdx = options.landPetInvIdx ?? 0
    this.oceanPetInvIdx = options.oceanPetInvIdx ?? 0
  }

  /**
   * Puts an item on
   * @param item The item
   */
  public wear(item: Item): void {
    item.wornBy.add(this.invId)
  }

  /**
   * Takes an item off
   * @param item The item
   */
  public takeOff(item: Item): void {
    if (!item.wornBy.delete(this.invId)) {
      throw new GameError('Not wearing that item', 'NOT_FOUND')
    }
  }

  /**
   * Whether it is wearing an item
   * @param item The item
   * @returns Whether it is worn
   */
  public wears(item: Item): boolean {
    return item.wornBy.has(this.invId)
  }
}
