import { AccountType } from '@peck/shared'
import { type SqlQuerier } from 'uql-orm'

import { RoleAssignment } from '#database/entities/access/assignment'
import { Role } from '#database/entities/access/role'
import { Account } from '#database/entities/accounts/account'
import { Player } from '#database/entities/player'
import { Seed } from '#database/seeder'

/**
 * The development accounts
 */
export const ACCOUNTS = [
  {
    username: 'sxip',
    password: 'peck123',
    role: 'owner',
    players: [{ username: 'sxip', accountType: AccountType.Internal }],
  },
] as const

/**
 * Seeds the development accounts
 * @class
 */
export class AccountsSeed extends Seed {
  /**
   * The seed name
   */
  public readonly name = 'accounts'

  /**
   * Writes the accounts and players
   * @param querier The querier
   */
  public async run(querier: SqlQuerier): Promise<void> {
    for (const { username, password, role, players } of ACCOUNTS) {
      const accountId = await this.account(querier, username, password)

      await this.assign(querier, accountId, role)

      for (const [index, player] of players.entries()) {
        if (
          await querier.exists(Player, {
            $where: { username: player.username },
          })
        ) {
          continue
        }
        await querier.insertOne(Player, {
          ...player,
          accountId,
          slot: index + 1,
        })
      }
    }
  }

  /**
   * Finds or creates an account
   * @param querier The querier
   * @param username The account's name
   * @param password The account's password
   * @returns The account's id
   */
  private async account(
    querier: SqlQuerier,
    username: string,
    password: string,
  ): Promise<string> {
    const found = await querier.findOne(Account, { $where: { username } })
    if (found) return found.id

    const id = crypto.randomUUID()

    await querier.insertOne(Account, {
      id,
      username,
      email: `${username}@peck.local`,
      passwordHash: await Bun.password.hash(password),
    })

    return id
  }

  /**
   * Gives an account a role
   * @param querier The querier
   * @param accountId The account id
   * @param key The role key
   */
  private async assign(
    querier: SqlQuerier,
    accountId: string,
    key: string,
  ): Promise<void> {
    const role = await querier.findOne(Role, { $where: { key } })
    if (!role) throw new Error(`Role ${key} is not seeded`)

    await querier.upsertOne(
      RoleAssignment,
      { accountId: true },
      { accountId, roleId: role.id },
    )
  }
}
