import { createHash, randomBytes } from 'node:crypto'

import { type ClusterStore } from '#cluster/store'

/**
 * How long an upload token lasts
 */
export const UPLOAD_TTL = 15 * 60_000

/**
 * Hands out upload tokens
 * @class
 */
export class UploadTokens {
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
   * Gives a player a token
   * @param gameId The player
   * @returns The token
   */
  public async issue(gameId: number): Promise<string> {
    const token = randomBytes(24).toString('hex')

    await this.store.put(UploadTokens.key(token), String(gameId), UPLOAD_TTL)

    return token
  }

  /**
   * Spends a token
   * @param token The token
   * @returns The player, or null
   */
  public async redeem(token: string): Promise<number | null> {
    if (token === '') return null

    const stored = await this.store.take(UploadTokens.key(token))

    return stored === null ? null : Number(stored)
  }

  /**
   * Finds a token's store
   * @param token The token
   * @returns The key
   */
  private static key(token: string): string {
    return `peck:upload:${createHash('sha256').update(token).digest('hex')}`
  }
}
