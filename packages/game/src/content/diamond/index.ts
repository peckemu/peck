import { Catalogue } from '#game/catalogue'

/**
 * What a diamond shop entry sells
 */
export const DiamondType = {
  /**
   * Clothing
   */
  Clothing: 0,

  /**
   * A den item
   */
  DenItem: 1,

  /**
   * A pet
   */
  Pet: 2,

  /**
   * An animal
   */
  Avatar: 3,

  /**
   * A den room
   */
  DenRoom: 4,

  /**
   * A custom animal
   */
  CustomAvatar: 5,
} as const

export type DiamondType = (typeof DiamondType)[keyof typeof DiamondType]

/**
 * A diamond shop entry
 */
export type DiamondTemplate = {
  /**
   * The entry's id in the diamond pack
   */
  readonly defId: number

  /**
   * What kind of thing it sells
   */
  readonly type: number

  /**
   * The definition id of what it sells
   */
  readonly refId: number

  /**
   * What it costs in diamonds
   */
  readonly cost: number

  /**
   * Its store status
   */
  readonly status: number

  /**
   * When it goes on sale
   */
  readonly availableFrom?: Date | null

  /**
   * When it comes off sale
   */
  readonly availableUntil?: Date | null
}

/**
 * Every diamond shop entry
 * @class
 */
export class DiamondCatalogue extends Catalogue<DiamondTemplate> {
  /**
   * The entries by item
   */
  private readonly byRef = new Map<string, DiamondTemplate>()

  /**
   * Adds an entry
   * @param definition The entry
   */
  public override register(definition: DiamondTemplate): void {
    super.register(definition)
    this.byRef.set(
      DiamondCatalogue.key(definition.type, definition.refId),
      definition,
    )
  }

  /**
   * Finds a selling entry
   * @param type Its kind
   * @param refId Its definition id
   * @returns The entry, or null
   */
  public selling(type: DiamondType, refId: number): DiamondTemplate | null {
    return this.byRef.get(DiamondCatalogue.key(type, refId)) ?? null
  }

  /**
   * Builds an entry's key
   * @param type Its kind
   * @param refId Its definition id
   * @returns The key
   */
  private static key(type: number, refId: number): string {
    return `${String(type)}:${String(refId)}`
  }
}
