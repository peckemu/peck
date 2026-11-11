import { inject, injectable } from '@needle-di/core'
import {
  type Account,
  AccountRepository,
  ModerationRepository,
  SessionRepository,
  type SessionTokens,
} from '@peck/database'

import { ServiceError } from '#api/errors'

/**
 * Signs accounts in and out
 * @class
 */
@injectable()
export class AuthService {
  /**
   * The accounts
   */
  private readonly accounts = inject<AccountRepository>(AccountRepository)

  /**
   * The sessions
   */
  private readonly sessions = inject<SessionRepository>(SessionRepository)

  /**
   * Keeps bans
   */
  private readonly moderation =
    inject<ModerationRepository>(ModerationRepository)

  /**
   * Signs an account in
   * @param login The username or email
   * @param password The password
   * @param device The device name
   * @returns The session tokens
   */
  public async signIn(
    login: string,
    password: string,
    device: string,
  ): Promise<SessionTokens> {
    const account = await this.accounts.byLogin(login)

    if (!account || !(await this.accounts.verify(account, password))) {
      throw new ServiceError('Wrong username or password', 'UNAUTHORIZED')
    }
    if (await this.moderation.active(account.id, 'ban')) {
      throw new ServiceError('Account is banned', 'FORBIDDEN')
    }

    return this.sessions.create(account.id, device)
  }

  /**
   * Swaps a refresh token for new tokens
   * @param refreshToken The refresh token
   * @returns The new tokens
   */
  public async refresh(refreshToken: string): Promise<SessionTokens> {
    const tokens = await this.sessions.refresh(refreshToken)
    if (!tokens) throw new ServiceError('Session has expired', 'UNAUTHORIZED')

    return tokens
  }

  /**
   * Signs a session out
   * @param token The session token
   */
  public async signOut(token: string): Promise<void> {
    await this.sessions.revoke(token)
  }

  /**
   * Finds a token's account
   * @param token The session token
   * @returns The account
   */
  public async accountOf(token: string): Promise<Account> {
    const account = await this.sessions.accountOf(token)
    if (!account) throw new ServiceError('Session has expired', 'UNAUTHORIZED')

    return account
  }
}
