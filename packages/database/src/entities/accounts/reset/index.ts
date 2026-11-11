import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  ManyToOne,
} from 'uql-orm'

import { Account } from '#database/entities/accounts/account'

/**
 * A request to reset an account's password
 * @class
 */
@Entity<PasswordReset>({
  name: 'password_resets',
  indexes: [
    {
      name: 'password_resets_account_index',
      columns: (reset) => [
        reset.accountId,
        { column: reset.createdAt, order: 'desc', nulls: 'first' },
      ],
    },
  ],
  checks: [
    {
      name: 'password_resets_token_hash_check',
      where: { tokenHash: { $regex: '^[0-9a-f]{64}$' } },
    },
  ],
})
export class PasswordReset {
  /**
   * The key field
   */
  declare public [idKey]?: 'tokenHash'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'createdAt'

  /**
   * The hash of the reset's token
   */
  @Id({ type: 'text' })
  public tokenHash!: string

  /**
   * The reset's account
   */
  @Field({
    references: () => Account,
    nullable: false,
    onDelete: 'CASCADE',
    index: false,
  })
  public accountId!: string

  /**
   * When the reset was made
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public createdAt!: Date

  /**
   * When the reset runs out
   */
  @Field({ type: Date, nullable: false })
  public expiresAt!: Date

  /**
   * When the reset was used
   */
  @Field({ type: Date })
  public usedAt?: Date | null

  /**
   * The reset's account
   */
  @ManyToOne({ entity: () => Account, references: (reset) => reset.accountId })
  public account?: Account
}
