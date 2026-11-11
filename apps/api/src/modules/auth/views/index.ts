import { type SessionTokens } from '@peck/database'

/**
 * A session view
 */
export type SessionView = {
  /**
   * The session token
   */
  readonly token: string

  /**
   * The refresh token
   */
  readonly refreshToken: string

  /**
   * When the session token expires
   */
  readonly expiresAt: string

  /**
   * When the refresh token expires
   */
  readonly refreshExpiresAt: string
}

/**
 * Turns session tokens into a response
 * @param tokens The tokens
 * @returns The session
 */
export const sessionView = (tokens: SessionTokens): SessionView => ({
  token: tokens.token,
  refreshToken: tokens.refreshToken,
  expiresAt: tokens.expiresAt.toISOString(),
  refreshExpiresAt: tokens.refreshExpiresAt.toISOString(),
})
