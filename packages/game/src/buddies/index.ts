/**
 * A buddy
 */
export type Buddy = {
  /**
   * Their id in the database
   */
  readonly gameId: number

  /**
   * Their username
   */
  readonly username: string

  /**
   * Their uuid
   */
  readonly uuid: string

  /**
   * Their account type
   */
  readonly accountType: number
}

/**
 * A player blocked
 */
export type Blocked = {
  /**
   * Their id in the database
   */
  readonly gameId: number

  /**
   * Their username
   */
  readonly username: string
}

/**
 * A player's buddies and blocks
 * @class
 */
export class Buddies implements Iterable<Buddy> {
  /**
   * The blockers' ids
   */
  public readonly blockedBy = new Set<number>()

  /**
   * The buddies by lowercase username
   */
  private readonly buddies = new Map<string, Buddy>()

  /**
   * The blocked players by username
   */
  private readonly blocked = new Map<string, Blocked>()

  /**
   * How many buddies there are
   */
  public get size(): number {
    return this.buddies.size
  }

  /**
   * The names of the players blocked
   */
  public get blockedUsernames(): readonly string[] {
    return [...this.blocked.values()].map(({ username }) => username)
  }

  /**
   * Adds a buddy
   * @param buddy The buddy
   */
  public add(buddy: Buddy): void {
    this.buddies.set(buddy.username.toLowerCase(), buddy)
  }

  /**
   * Removes a buddy
   * @param username Their username
   * @returns The buddy, or null
   */
  public remove(username: string): Buddy | null {
    const key = username.toLowerCase()
    const buddy = this.buddies.get(key) ?? null
    this.buddies.delete(key)

    return buddy
  }

  /**
   * Finds a buddy
   * @param username Their username
   * @returns The buddy, or null
   */
  public get(username: string): Buddy | null {
    return this.buddies.get(username.toLowerCase()) ?? null
  }

  /**
   * Checks a player is a buddy
   * @param username Their username
   * @returns Whether they are
   */
  public has(username: string): boolean {
    return this.buddies.has(username.toLowerCase())
  }

  /**
   * Follows a player's new username
   * @param from Their old username
   * @param to Their new username
   */
  public rename(from: string, to: string): void {
    const buddy = this.remove(from)
    if (buddy) this.add({ ...buddy, username: to })

    const blocked = this.blocked.get(from.toLowerCase())
    if (!blocked) return

    this.blocked.delete(from.toLowerCase())
    this.blocked.set(to.toLowerCase(), { ...blocked, username: to })
  }

  /**
   * Blocks a player
   * @param player The player
   */
  public block(player: Blocked): void {
    this.remove(player.username)
    this.blocked.set(player.username.toLowerCase(), player)
  }

  /**
   * Unblocks a player
   * @param username Their username
   */
  public unblock(username: string): void {
    this.blocked.delete(username.toLowerCase())
  }

  /**
   * Checks a player is blocked
   * @param username Their username
   * @returns Whether they are
   */
  public blocks(username: string): boolean {
    return this.blocked.has(username.toLowerCase())
  }

  /**
   * Iterates over the buddies
   * @returns The iterator
   */
  public [Symbol.iterator](): Iterator<Buddy> {
    return this.buddies.values()
  }
}
