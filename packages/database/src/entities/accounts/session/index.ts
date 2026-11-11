import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  ManyToOne,
  sql,
  uuid,
} from 'uql-orm'

import { Account } from '#database/entities/accounts/account'

/**
 * A signed in session on an account
 * @class
 */
@Entity<Session>({
  name: 'account_sessions',
  indexes: [
    {
      name: 'account_sessions_account_index',
      columns: (session) => [session.accountId, session.refreshExpiresAt],
    },
  ],
  checks: [
    {
      name: 'account_sessions_expires_check',
      where: (session) => sql`${session.expiresAt} > ${session.createdAt}`,
    },
    {
      name: 'account_sessions_refresh_expires_check',
      where: (session) =>
        sql`${session.refreshExpiresAt} >= ${session.expiresAt}`,
    },
    {
      name: 'account_sessions_device_check',
      where: (session) => sql`char_length(${session.device}) BETWEEN 1 AND 80`,
    },
    {
      name: 'account_sessions_token_hash_check',
      where: { tokenHash: { $regex: '^[0-9a-f]{64}$' } },
    },
    {
      name: 'account_sessions_refresh_token_hash_check',
      where: { refreshTokenHash: { $regex: '^[0-9a-f]{64}$' } },
    },
  ],
})
export class Session {
  /**
   * The key field
   */
  declare public [idKey]?: 'tokenHash'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?:
    'id' | 'device' | 'createdAt' | 'signedInAt' | 'lastUsedAt'

  /**
   * The hash of the session's token
   */
  @Id({ type: 'text' })
  public tokenHash!: string

  /**
   * The refresh token hash
   */
  @Field({ type: 'text', nullable: false, unique: true })
  public refreshTokenHash!: string

  /**
   * The session's public id
   */
  @Field({ type: 'uuid', nullable: false, unique: true, defaultValue: uuid })
  public id!: string

  /**
   * The account signed in
   */
  @Field({
    references: () => Account,
    nullable: false,
    onDelete: 'CASCADE',
    index: false,
  })
  public accountId!: string

  /**
   * The session's device
   */
  @Field({ type: 'text', nullable: false, defaultValue: 'Unknown device' })
  public device!: string

  /**
   * When the session was made
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public createdAt!: Date

  /**
   * When the account signed in
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public signedInAt!: Date

  /**
   * When the session was last used
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public lastUsedAt!: Date

  /**
   * When the session's token runs out
   */
  @Field({ type: Date, nullable: false })
  public expiresAt!: Date

  /**
   * The renewal deadline
   */
  @Field({ type: Date, nullable: false })
  public refreshExpiresAt!: Date

  /**
   * The account signed in
   */
  @ManyToOne({
    entity: () => Account,
    references: (session) => session.accountId,
  })
  public account?: Account
}
