/**
 * The egg hatch time in seconds
 */
export const HATCH_SECONDS = 259_200

/**
 * A stored pet
 */
export type PetOptions = {
  /**
   * Its place in the player's pets
   */
  readonly invIdx: number

  /**
   * The adoption time in seconds
   */
  readonly createdTs: number

  /**
   * Its name
   */
  readonly name: string

  /**
   * Its look
   */
  readonly lBits: number

  /**
   * Extra traits
   */
  readonly uBits: number

  /**
   * Unused look bits
   */
  readonly eBits: number

  /**
   * Its mastery points
   */
  readonly masteryCounter?: number

  /**
   * Its personality
   */
  readonly personalityDefId?: number

  /**
   * Its favourite toy
   */
  readonly favoriteToyDefId?: number

  /**
   * Its favourite food
   */
  readonly favoriteFoodDefId?: number

  /**
   * The den shop listing, or 0
   */
  readonly denStoreInvIdx?: number

  /**
   * Its place, or 0
   */
  readonly denCategoryId?: number

  /**
   * Where it stands across in the den
   */
  readonly denX?: number

  /**
   * Where it stands down in the den
   */
  readonly denY?: number

  /**
   * How it is flipped in the den
   */
  readonly denFlipped?: number
}

/**
 * A pet a player owns
 * @class
 */
export class Pet {
  /**
   * Its place in the player's pets
   */
  public readonly invId: number

  /**
   * The adoption time in seconds
   */
  public readonly createdTs: number

  /**
   * Its name
   */
  public name: string

  /**
   * Its look
   */
  public lBits: number

  /**
   * Extra traits
   */
  public uBits: number

  /**
   * Unused look bits
   */
  public eBits: number

  /**
   * Its mastery points
   */
  public masteryCounter: number

  /**
   * Its personality
   */
  public personalityDefId: number

  /**
   * Its favourite toy
   */
  public favoriteToyDefId: number

  /**
   * Its favourite food
   */
  public favoriteFoodDefId: number

  /**
   * The den shop listing, or 0
   */
  public denStoreInvIdx: number

  /**
   * Its place, or 0
   */
  public denCategoryId: number

  /**
   * Where it stands across in the den
   */
  public denX: number

  /**
   * Where it stands down in the den
   */
  public denY: number

  /**
   * How it is flipped in the den
   */
  public denFlipped: number

  /**
   * Creates a pet
   * @param options The stored pet
   */
  public constructor(options: PetOptions) {
    this.invId = options.invIdx
    this.createdTs = options.createdTs
    this.name = options.name
    this.lBits = options.lBits
    this.uBits = options.uBits
    this.eBits = options.eBits
    this.masteryCounter = options.masteryCounter ?? 0
    this.personalityDefId = options.personalityDefId ?? 0
    this.favoriteToyDefId = options.favoriteToyDefId ?? 0
    this.favoriteFoodDefId = options.favoriteFoodDefId ?? 0
    this.denStoreInvIdx = options.denStoreInvIdx ?? 0
    this.denCategoryId = options.denCategoryId ?? 0
    this.denX = options.denX ?? 0
    this.denY = options.denY ?? 0
    this.denFlipped = options.denFlipped ?? 0
  }

  /**
   * Its definition id
   */
  public get defId(): number {
    return this.lBits & 0xff
  }

  /**
   * Checks an egg has hatched
   * @param now The time in seconds
   * @returns Whether it has
   */
  public hatched(now: number): boolean {
    return this.createdTs + HATCH_SECONDS <= now
  }
}

/**
 * Keeps unlocked pets
 * @class
 */
export class PetUnlocks {
  /**
   * Checks a pet is unlocked
   * @param field The unlocked pets
   * @param defId The pet's definition id
   * @returns Whether it is
   */
  public static has(field: string, defId: number): boolean {
    if (defId <= 0) return false

    const words = PetUnlocks.words(field)
    const word = words[Math.floor((defId - 1) / 32)] ?? 0

    return ((word >>> ((defId - 1) % 32)) & 1) === 1
  }

  /**
   * Unlocks a pet
   * @param field The unlocked pets
   * @param defId The pet's definition id
   * @returns The unlocked pets afterwards
   */
  public static with(field: string, defId: number): string {
    if (defId <= 0) return field

    const words = PetUnlocks.words(field)
    const at = Math.floor((defId - 1) / 32)
    while (words.length <= at) words.push(0)

    words[at] = ((words[at] ?? 0) | (1 << ((defId - 1) % 32))) >>> 0

    return words.join(',')
  }

  /**
   * Reads the words
   * @param field The unlocked pets
   * @returns The words
   */
  private static words(field: string): number[] {
    return field.split(',').map((word) => Number(word) >>> 0)
  }
}
