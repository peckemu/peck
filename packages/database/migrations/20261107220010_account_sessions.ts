import { currentTimestamp, uuid } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the account sessions table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('account_sessions', (table) => {
      table.text('token_hash').primaryKey()
      table.text('refresh_token_hash').notNullable().unique()
      table.uuid('id').notNullable().unique().defaultValue(uuid)
      table
        .uuid('account_id')
        .notNullable()
        .references('accounts', 'id')
        .onDelete('CASCADE')
      table.text('device').notNullable().defaultValue('Unknown device')
      table
        .timestamptz('created_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table
        .timestamptz('signed_in_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table
        .timestamptz('last_used_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.timestamptz('expires_at').notNullable()
      table.timestamptz('refresh_expires_at').notNullable()
      table.index(
        ['account_id', 'refresh_expires_at'],
        'account_sessions_account_index',
      )
    })

    await addChecks(schema, 'account_sessions', {
      _uql_account_sessions__account_sessions_expires_check_31e379:
        '"expires_at" > "created_at"',
      _uql_account_sessions__account_sessions_refresh_e_0ed783_df22ae:
        '"refresh_expires_at" >= "expires_at"',
      _uql_account_sessions__account_sessions_device_check_d95a87:
        'char_length("device") BETWEEN 1 AND 80',
      _uql_account_sessions__account_sessions_token_hash_check_a1d0e7: String.raw`"token_hash" ~ '^[0-9a-f]{64}$'`,
      _uql_account_sessions__account_sessions_refresh_t_a5dda9_28592b: String.raw`"refresh_token_hash" ~ '^[0-9a-f]{64}$'`,
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('account_sessions')
  },
})
