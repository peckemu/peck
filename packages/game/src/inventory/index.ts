import { GameError } from '#game/error'

/**
 * Anything an inventory can hold
 */
export type Stored = {
  /**
   * The thing's id in the inventory
   */
  readonly invId: number
}

/**
 * An inventory
 * @class
 */
export class Inventory<T extends Stored> implements Iterable<T> {
  /**
   * The most it can hold
   */
  public readonly capacity: number

  /**
   * The things it holds
   */
  private readonly entries = new Map<number, T>()

  /**
   * Creates an inventory
   * @param capacity The most it can hold
   */
  public constructor(capacity = Infinity) {
    this.capacity = capacity
  }

  /**
   * How many things it holds
   */
  public get size(): number {
    return this.entries.size
  }

  /**
   * Whether it cannot take any more
   */
  public get full(): boolean {
    return this.entries.size >= this.capacity
  }

  /**
   * The next free inventory id
   */
  public get nextId(): number {
    let id = 1
    for (const invId of this.entries.keys()) id = Math.max(id, invId + 1)
    return id
  }

  /**
   * Adds a thing
   * @param entry The thing
   * @returns The thing
   */
  public add(entry: T): T {
    if (this.entries.has(entry.invId)) {
      throw new GameError('Already in the inventory', 'DUPLICATE')
    }
    if (this.full) throw new GameError('Inventory is full', 'INVENTORY_FULL')
    this.entries.set(entry.invId, entry)
    return entry
  }

  /**
   * Takes a thing out
   * @param invId The thing's inventory id
   * @returns The thing
   */
  public remove(invId: number): T {
    const entry = this.require(invId)
    this.entries.delete(invId)
    return entry
  }

  /**
   * Finds a thing
   * @param invId The thing's inventory id
   * @returns The thing, or null
   */
  public get(invId: number): T | null {
    return this.entries.get(invId) ?? null
  }

  /**
   * Finds a required thing
   * @param invId The thing's inventory id
   * @returns The thing
   */
  public require(invId: number): T {
    const entry = this.entries.get(invId)
    if (!entry) throw new GameError('Not in the inventory', 'NOT_FOUND')
    return entry
  }

  /**
   * Whether it holds a thing
   * @param invId The thing's inventory id
   * @returns Whether it is there
   */
  public has(invId: number): boolean {
    return this.entries.has(invId)
  }

  /**
   * Iterates over the things it holds
   * @returns The iterator
   */
  public [Symbol.iterator](): Iterator<T> {
    return this.entries.values()
  }
}
