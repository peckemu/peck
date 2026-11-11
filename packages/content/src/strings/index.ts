import { type Pack } from '#content/pack'

/**
 * The placeholder string id
 */
const PLACEHOLDER = 2

/**
 * Localisation strings
 * @class
 */
export class Strings implements Iterable<[number, string]> {
  /**
   * The strings by id
   */
  private readonly strings = new Map<number, string>()

  /**
   * Creates the strings
   * @param pack The localisation pack
   */
  public constructor(pack: Pack) {
    for (const [key, value] of Object.entries(pack.entries())) {
      const id = Number(key)
      if (Number.isInteger(id) && typeof value === 'string') {
        this.strings.set(id, value)
      }
    }
  }

  /**
   * How many strings there are
   */
  public get size(): number {
    return this.strings.size
  }

  /**
   * Gets the name for a string id
   * @param id The string id
   * @returns The name, or null
   */
  public name(id: number): string | null {
    if (id === 0 || id === PLACEHOLDER) return null
    const text = this.strings.get(id)?.trim() ?? ''
    return text === '' ? null : text
  }

  /**
   * Gets a raw string
   * @param id The string id
   * @returns The text, or undefined
   */
  public text(id: number): string | undefined {
    return this.strings.get(id)
  }

  /**
   * Iterates over the strings
   * @returns The iterator
   */
  public [Symbol.iterator](): Iterator<[number, string]> {
    return this.strings.entries()
  }
}
