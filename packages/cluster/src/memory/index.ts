import { type ClusterStore } from '#cluster/store'

/**
 * A stored value
 */
type Entry = {
  /**
   * The value
   */
  readonly value: string

  /**
   * When it expires, or null
   */
  readonly expires: number | null
}

/**
 * The cluster state in memory
 * @class
 */
export class MemoryStore implements ClusterStore {
  /**
   * The values by key
   */
  private readonly values = new Map<string, Entry>()

  /**
   * The sets by key
   */
  private readonly sets = new Map<string, Set<string>>()

  /**
   * The clock
   */
  /**
   * The listeners by channel
   */
  private readonly listeners = new Map<string, ((message: string) => void)[]>()

  private readonly now: () => number

  /**
   * Creates the store
   * @param now The clock
   */
  public constructor(now: () => number = Date.now) {
    this.now = now
  }

  /**
   * Reads a value
   * @param key The key
   * @returns The value, or null
   */
  public get(key: string): Promise<string | null> {
    return Promise.resolve(this.read(key))
  }

  /**
   * Writes an expiring value
   * @param key The key
   * @param value The value
   * @param ttl The lifetime in milliseconds
   */
  public put(key: string, value: string, ttl: number): Promise<void> {
    this.values.set(key, { value, expires: this.now() + ttl })

    return Promise.resolve()
  }

  /**
   * Writes a lasting value
   * @param key The key
   * @param value The value
   */
  public keep(key: string, value: string): Promise<void> {
    this.values.set(key, { value, expires: null })

    return Promise.resolve()
  }

  /**
   * Reads and deletes a value
   * @param key The key
   * @returns The value, or null
   */
  public take(key: string): Promise<string | null> {
    const value = this.read(key)
    this.values.delete(key)

    return Promise.resolve(value)
  }

  /**
   * Deletes a value
   * @param key The key
   */
  public delete(key: string): Promise<void> {
    this.values.delete(key)

    return Promise.resolve()
  }

  /**
   * Claims a key for an owner
   * @param key The key
   * @param owner The owner
   * @param ttl The claim's lifetime in milliseconds
   * @returns Whether the owner holds it
   */
  public claim(key: string, owner: string, ttl: number): Promise<boolean> {
    const held = this.read(key)
    if (held !== null && held !== owner) return Promise.resolve(false)

    this.values.set(key, { value: owner, expires: this.now() + ttl })

    return Promise.resolve(true)
  }

  /**
   * Lets a claim go
   * @param key The key
   * @param owner The owner
   */
  public release(key: string, owner: string): Promise<void> {
    if (this.read(key) === owner) this.values.delete(key)

    return Promise.resolve()
  }

  /**
   * Adds to a set
   * @param key The set
   * @param member The member
   */
  public add(key: string, member: string): Promise<void> {
    const set = this.sets.get(key) ?? new Set()
    set.add(member)
    this.sets.set(key, set)

    return Promise.resolve()
  }

  /**
   * Removes from a set
   * @param key The set
   * @param member The member
   */
  public remove(key: string, member: string): Promise<void> {
    this.sets.get(key)?.delete(member)

    return Promise.resolve()
  }

  /**
   * Lists a set
   * @param key The set
   * @returns The members
   */
  public members(key: string): Promise<string[]> {
    return Promise.resolve([...(this.sets.get(key) ?? [])])
  }

  /**
   * Reads several values
   * @param keys The keys
   * @returns The values
   */
  public many(keys: readonly string[]): Promise<(string | null)[]> {
    return Promise.resolve(keys.map((key) => this.read(key)))
  }

  /**
   * Tells every listener on a channel
   * @param channel The channel
   * @param message The message
   */
  public publish(channel: string, message: string): Promise<void> {
    for (const listener of this.listeners.get(channel) ?? []) listener(message)

    return Promise.resolve()
  }

  /**
   * Listens to a channel
   * @param channel The channel
   * @param listener The message listener
   */
  public subscribe(
    channel: string,
    listener: (message: string) => void,
  ): Promise<void> {
    const listeners = this.listeners.get(channel) ?? []
    this.listeners.set(channel, [...listeners, listener])

    return Promise.resolve()
  }

  /**
   * Reads a live value
   * @param key The key
   * @returns The value, or null
   */
  private read(key: string): string | null {
    const entry = this.values.get(key)
    if (!entry) return null

    if (entry.expires !== null && entry.expires <= this.now()) {
      this.values.delete(key)
      return null
    }

    return entry.value
  }
}
