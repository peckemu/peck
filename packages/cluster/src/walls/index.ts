import { randomBytes } from 'node:crypto'

import { type ClusterStore } from '#cluster/store'

/**
 * How long a wall token lasts
 */
export const WALL_TTL = 2 * 60 * 60_000

/**
 * A wall token's details
 */
export type WallTicket = {
  /**
   * The player holding it
   */
  readonly holderGameId: number

  /**
   * The wall's owner
   */
  readonly ownerGameId: number
}

/**
 * Hands out wall tokens
 * @class
 */
export class WallTokens {
  /**
   * Where tokens are kept
   */
  private readonly store: ClusterStore

  /**
   * Creates the token store
   * @param store The token store
   */
  public constructor(store: ClusterStore) {
    this.store = store
  }

  /**
   * Gives a player a token for a wall
   * @param ticket What it is for
   * @returns The token
   */
  public async issue(ticket: WallTicket): Promise<string> {
    const token = randomBytes(24).toString('hex')

    await this.store.put(
      WallTokens.key(token),
      JSON.stringify(ticket),
      WALL_TTL,
    )

    return token
  }

  /**
   * Reads a token
   * @param token The token
   * @returns What it is for, or null
   */
  public async read(token: string): Promise<WallTicket | null> {
    if (!/^[\da-f]{48}$/.test(token)) return null

    const stored = await this.store.get(WallTokens.key(token))

    return stored === null ? null : (JSON.parse(stored) as WallTicket)
  }

  /**
   * Finds a token's store
   * @param token The token
   * @returns The key
   */
  private static key(token: string): string {
    return `peck:wall:${token}`
  }
}
