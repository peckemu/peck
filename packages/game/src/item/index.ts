/**
 * How an item is made
 */
export type ItemOptions = {
  /**
   * Its place in the inventory
   */
  readonly invId: number

  /**
   * Its definition id
   */
  readonly defId: number

  /**
   * Its colour
   */
  readonly color?: number

  /**
   * The avatar slots wearing it
   */
  readonly equippedAvatars?: string

  /**
   * The den shop listing, or 0
   */
  readonly denStoreInvIdx?: number
}

/**
 * An item a player owns
 * @class
 */
export class Item {
  /**
   * Its place in the inventory
   */
  public readonly invId: number

  /**
   * Its definition id
   */
  public readonly defId: number

  /**
   * Its colour
   */
  public color: number

  /**
   * The den shop listing, or 0
   */
  public denStoreInvIdx: number

  /**
   * The avatar slots wearing it
   */
  public readonly wornBy = new Set<number>()

  /**
   * Creates an item
   * @param options The options
   */
  public constructor(options: ItemOptions) {
    this.invId = options.invId
    this.defId = options.defId
    this.color = options.color ?? 0
    this.denStoreInvIdx = options.denStoreInvIdx ?? 0

    for (const slot of Item.slots(options.equippedAvatars ?? '0')) {
      this.wornBy.add(slot)
    }
  }

  /**
   * Whether any avatar is wearing it
   */
  public get worn(): boolean {
    return this.wornBy.size > 0
  }

  /**
   * The avatar slots wearing it
   */
  public get equippedAvatars(): string {
    const words = [0]

    for (const slot of this.wornBy) {
      const index = Math.floor(slot / 32)
      while (words.length <= index) words.push(0)
      words[index] = ((words[index] ?? 0) | (1 << (slot % 32))) >>> 0
    }

    return words.join(',')
  }

  /**
   * Reads the avatar slots in a bit field
   * @param bits The bit field
   * @returns The slots
   */
  private static slots(bits: string): number[] {
    return bits.split(',').flatMap((word, index) => {
      const value = Number(word) >>> 0

      return Array.from({ length: 32 }, (_, bit) => bit)
        .filter((bit) => (value & (1 << bit)) !== 0)
        .map((bit) => index * 32 + bit)
    })
  }
}
