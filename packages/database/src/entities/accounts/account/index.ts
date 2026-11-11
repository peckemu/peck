import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  OneToMany,
  sql,
  uuid,
} from 'uql-orm'

import { Confirmation } from '#database/entities/accounts/confirmation'
import { PasswordReset } from '#database/entities/accounts/reset'
import { Session } from '#database/entities/accounts/session'
import { Player } from '#database/entities/player'

/**
 * An account
 * @class
 */
@Entity<Account>({
  name: 'accounts',
  indexes: [
    {
      name: 'accounts_username_key',
      unique: true,
      columns: (account) => [sql`lower(${account.username})`],
    },
  ],
  checks: [
    {
      name: 'accounts_email_check',
      where: (account) => sql`
        ${account.email} = lower(${account.email})
        AND ${account.email} !~ '\\s'
        AND ${account.email} ~ '^[^@]+@[^@]+\\.[^@]+$'
        AND char_length(${account.email}) BETWEEN 3 AND 254
      `,
    },
    {
      name: 'accounts_password_hash_check',
      where: (account) =>
        sql`char_length(${account.passwordHash}) BETWEEN 16 AND 512`,
    },
    {
      name: 'accounts_username_format',
      where: { username: { $regex: '^[A-Za-z0-9_]{3,20}$' } },
    },
  ],
})
export class Account {
  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'emailConfirmed' | 'createdAt' | 'updatedAt'

  /**
   * The account's id
   */
  @Id({ type: 'uuid', defaultValue: uuid })
  public id!: string

  /**
   * The account's username
   */
  @Field({ type: 'text', nullable: false })
  public username!: string

  /**
   * The lowercase email address
   */
  @Field({ type: 'text', nullable: false, unique: true })
  public email!: string

  /**
   * Whether the email address has been confirmed
   */
  @Field({ type: Boolean, nullable: false, defaultValue: false })
  public emailConfirmed!: boolean

  /**
   * When the email address was confirmed
   */
  @Field({ type: Date })
  public emailConfirmedAt?: Date | null

  /**
   * The hash of the account's password
   */
  @Field({ type: 'text', nullable: false })
  public passwordHash!: string

  /**
   * When the account was made
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public createdAt!: Date

  /**
   * When the account was last changed
   */
  @Field({
    type: Date,
    nullable: false,
    defaultValue: currentTimestamp,
    onUpdate: () => new Date(),
  })
  public updatedAt!: Date

  /**
   * The players on the account
   */
  @OneToMany({ entity: () => Player, mappedBy: (player) => player.account })
  public players?: Player[]

  /**
   * The account's sessions
   */
  @OneToMany({ entity: () => Session, mappedBy: (session) => session.account })
  public sessions?: Session[]

  /**
   * The account's password resets
   */
  @OneToMany({
    entity: () => PasswordReset,
    mappedBy: (reset) => reset.account,
  })
  public passwordResets?: PasswordReset[]

  /**
   * The account's email confirmations
   */
  @OneToMany({
    entity: () => Confirmation,
    mappedBy: (confirmation) => confirmation.account,
  })
  public confirmations?: Confirmation[]
}
