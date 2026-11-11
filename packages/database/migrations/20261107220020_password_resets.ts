import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the password resets table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('password_resets', (table) => {
      table.text('token_hash').primaryKey()
      table
        .uuid('account_id')
        .notNullable()
        .references('accounts', 'id')
        .onDelete('CASCADE')
      table
        .timestamptz('created_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.timestamptz('expires_at').notNullable()
      table.timestamptz('used_at').nullable()
      table.index(
        ['account_id', { column: 'created_at', order: 'desc', nulls: 'first' }],
        'password_resets_account_index',
      )
    })

    await addChecks(schema, 'password_resets', {
      _uql_password_resets__password_resets_token_hash_check_a1d0e7: String.raw`"token_hash" ~ '^[0-9a-f]{64}$'`,
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('password_resets')
  },
})
