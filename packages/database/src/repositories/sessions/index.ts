import { createHash, randomBytes } from 'node:crypto'

import { type Account } from '#database/entities/accounts/account'
import { Session } from '#database/entities/accounts/session'
import { type Database } from '#database/pool'

/**
 * How long a session token lasts
 */
const TOKEN_LIFETIME = 24 * 60 * 60 * 1000

/**
 * How long a refresh token lasts
 */
const REFRESH_LIFETIME = 30 * 24 * 60 * 60 * 1000

/**
 * A new session's tokens
 */
export type SessionTokens = {
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
  readonly expiresAt: Date

  /**
   * When the refresh token expires
   */
  readonly refreshExpiresAt: Date
}

/**
 * Reads and writes account sessions
 * @class
 */
export class SessionRepository {
  /**
   * The database
   */
  private readonly database: Database

  /**
   * Creates the repository
   * @param database The database
   */
  public constructor(database: Database) {
    this.database = database
  }

  /**
   * Finds the account for a session token
   * @param token The session token
   * @returns The account, or null
   */
  public async accountOf(token: string): Promise<Account | null> {
    if (token === '') return null
    const tokenHash = SessionRepository.hash(token)
    const now = new Date()

    const session = await this.database.findOne(Session, {
      $where: { tokenHash, expiresAt: { $gt: now } },
      $populate: { account: true },
    })
    if (!session?.account) return null

    await this.database.updateOneById(Session, tokenHash, { lastUsedAt: now })

    return session.account
  }

  /**
   * Starts a session
   * @param accountId The account id
   * @param device The device name
   * @returns The tokens
   */
  public async create(
    accountId: string,
    device: string,
  ): Promise<SessionTokens> {
    const tokens = SessionRepository.tokens()

    await this.database.insertOne(Session, {
      tokenHash: SessionRepository.hash(tokens.token),
      refreshTokenHash: SessionRepository.hash(tokens.refreshToken),
      accountId,
      device,
      expiresAt: tokens.expiresAt,
      refreshExpiresAt: tokens.refreshExpiresAt,
    })

    return tokens
  }

  /**
   * Swaps a refresh token for new tokens
   * @param refreshToken The refresh token
   * @returns The new tokens, or null
   */
  public async refresh(refreshToken: string): Promise<SessionTokens | null> {
    if (refreshToken === '') return null
    const session = await this.database.findOne(Session, {
      $where: {
        refreshTokenHash: SessionRepository.hash(refreshToken),
        refreshExpiresAt: { $gt: new Date() },
      },
    })
    if (!session) return null

    await this.database.deleteOneById(Session, session.tokenHash)

    return this.create(session.accountId, session.device)
  }

  /**
   * Ends a session
   * @param token The session token
   */
  public async revoke(token: string): Promise<void> {
    await this.database.deleteMany(Session, {
      $where: { tokenHash: SessionRepository.hash(token) },
    })
  }

  /**
   * Makes new tokens
   * @returns The tokens
   */
  private static tokens(): SessionTokens {
    const now = Date.now()
    return {
      token: randomBytes(32).toString('hex'),
      refreshToken: randomBytes(32).toString('hex'),
      expiresAt: new Date(now + TOKEN_LIFETIME),
      refreshExpiresAt: new Date(now + REFRESH_LIFETIME),
    }
  }

  /**
   * Hashes a token
   * @param token The token
   * @returns The hash
   */
  private static hash(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }
}
