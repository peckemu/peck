import { GameError } from '#game/error'

/**
 * A definition
 */
export type Defined = {
  /**
   * The definition id
   */
  readonly defId: number
}

/**
 * Definitions by id
 * @class
 */
export class Catalogue<T extends Defined> implements Iterable<T> {
  /**
   * The definitions by id
   */
  private readonly definitions = new Map<number, T>()

  /**
   * How many definitions it holds
   */
  public get size(): number {
    return this.definitions.size
  }

  /**
   * Adds a definition
   * @param definition The definition
   */
  public register(definition: T): void {
    if (this.definitions.has(definition.defId)) {
      throw new GameError(
        `Definition ${String(definition.defId)} already exists`,
        'DUPLICATE',
      )
    }
    this.definitions.set(definition.defId, definition)
  }

  /**
   * Finds a definition
   * @param defId The definition id
   * @returns The definition, or null
   */
  public get(defId: number): T | null {
    return this.definitions.get(defId) ?? null
  }

  /**
   * Whether a definition exists
   * @param defId The definition id
   * @returns Whether it does
   */
  public has(defId: number): boolean {
    return this.definitions.has(defId)
  }

  /**
   * Iterates over the definitions
   * @returns The iterator
   */
  public [Symbol.iterator](): Iterator<T> {
    return this.definitions.values()
  }
}
