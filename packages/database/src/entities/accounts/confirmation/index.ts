import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  ManyToOne,
  sql,
} from 'uql-orm'

import { Account } from '#database/entities/accounts/account'

/**
 * An email confirmation request
 * @class
 */
@Entity<Confirmation>({
  name: 'email_confirmations',
  indexes: [
    {
      name: 'email_confirmations_account_index',
      columns: (confirmation) => [
        confirmation.accountId,
        { column: confirmation.createdAt, order: 'desc', nulls: 'first' },
      ],
    },
  ],
  checks: [
    {
      name: 'email_confirmations_token_hash_check',
      where: { tokenHash: { $regex: '^[0-9a-f]{64}$' } },
    },
    {
      name: 'email_confirmations_expires_check',
      where: (confirmation) =>
        sql`${confirmation.expiresAt} > ${confirmation.createdAt}`,
    },
  ],
})
export class Confirmation {
  /**
   * The key field
   */
  declare public [idKey]?: 'tokenHash'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'createdAt'

  /**
   * The hash of the confirmation's token
   */
  @Id({ type: 'text' })
  public tokenHash!: string

  /**
   * The confirmation's account
   */
  @Field({
    references: () => Account,
    nullable: false,
    onDelete: 'CASCADE',
    index: false,
  })
  public accountId!: string

  /**
   * When the confirmation was made
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public createdAt!: Date

  /**
   * When the confirmation runs out
   */
  @Field({ type: Date, nullable: false })
  public expiresAt!: Date

  /**
   * When the confirmation was used
   */
  @Field({ type: Date })
  public usedAt?: Date | null

  /**
   * The confirmation's account
   */
  @ManyToOne({
    entity: () => Account,
    references: (confirmation) => confirmation.accountId,
  })
  public account?: Account
}
