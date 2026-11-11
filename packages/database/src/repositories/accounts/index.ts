import { Account } from '#database/entities/accounts/account'
import { type Database } from '#database/pool'

/**
 * A new account
 */
export type NewAccount = {
  /**
   * The username
   */
  readonly username: string

  /**
   * The email address
   */
  readonly email: string

  /**
   * The password
   */
  readonly password: string
}

/**
 * Reads and writes accounts
 * @class
 */
export class AccountRepository {
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
   * Finds an account by id
   * @param id The account id
   * @returns The account, or null
   */
  public async byId(id: string): Promise<Account | null> {
    return (await this.database.findOneById(Account, id)) ?? null
  }

  /**
   * Finds an account by username or email
   * @param login The username or email
   * @returns The account, or null
   */
  public async byLogin(login: string): Promise<Account | null> {
    const found = login.includes('@')
      ? await this.database.findOne(Account, {
          $where: { email: login.toLowerCase() },
        })
      : await this.database.findOne(Account, {
          $where: { username: { $ilike: login.replace(/[\\%_]/g, '\\$&') } },
        })
    return found ?? null
  }

  /**
   * Checks a username or email is taken
   * @param username The username
   * @param email The email
   * @returns The taken amount, or null
   */
  public async taken(
    username: string,
    email: string,
  ): Promise<'username' | 'email' | null> {
    if (await this.byLogin(username)) return 'username'
    if (await this.byLogin(email)) return 'email'

    return null
  }

  /**
   * Creates an account
   * @param account The new account
   * @returns The account
   */
  public async create(account: NewAccount): Promise<Account> {
    const id = crypto.randomUUID()

    await this.database.insertOne(Account, {
      id,
      username: account.username,
      email: account.email.toLowerCase(),
      passwordHash: await Bun.password.hash(account.password),
    })

    const created = await this.byId(id)
    if (!created) throw new Error('Account was not created')

    return created
  }

  /**
   * Checks an account's password
   * @param account The account
   * @param password The password
   * @returns Whether it matches
   */
  public async verify(account: Account, password: string): Promise<boolean> {
    return Bun.password.verify(password, account.passwordHash)
  }
}
