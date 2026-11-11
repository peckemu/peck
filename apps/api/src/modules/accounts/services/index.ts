import { inject, injectable } from '@needle-di/core'
import {
  type Account,
  AccountRepository,
  type NewAccount,
  type Player,
  PlayerRepository,
} from '@peck/database'

import { ServiceError } from '#api/errors'

/**
 * Creates and reads accounts
 * @class
 */
@injectable()
export class AccountService {
  /**
   * The accounts
   */
  private readonly accounts = inject<AccountRepository>(AccountRepository)

  /**
   * The players
   */
  private readonly players = inject<PlayerRepository>(PlayerRepository)

  /**
   * Registers an account
   * @param account The new account
   * @returns The account
   */
  public async register(account: NewAccount): Promise<Account> {
    const taken = await this.accounts.taken(account.username, account.email)
    if (taken === 'username') {
      throw new ServiceError('Username is taken', 'CONFLICT')
    }
    if (taken === 'email') throw new ServiceError('Email is taken', 'CONFLICT')

    return this.accounts.create(account)
  }

  /**
   * Lists an account's players
   * @param accountId The account id
   * @returns The players
   */
  public async playersOf(accountId: string): Promise<Player[]> {
    return this.players.ofAccount(accountId)
  }
}
