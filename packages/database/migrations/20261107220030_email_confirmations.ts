import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the email confirmations table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('email_confirmations', (table) => {
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
        'email_confirmations_account_index',
      )
    })

    await addChecks(schema, 'email_confirmations', {
      _uql_email_confirmations__email_confirmations_tok_657607_a1d0e7: String.raw`"token_hash" ~ '^[0-9a-f]{64}$'`,
      _uql_email_confirmations__email_confirmations_exp_bd32e9_31e379:
        '"expires_at" > "created_at"',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('email_confirmations')
  },
})
