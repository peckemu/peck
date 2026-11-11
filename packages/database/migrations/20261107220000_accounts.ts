import { currentTimestamp, sql, uuid } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the accounts table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('accounts', (table) => {
      table.uuid('id').primaryKey().defaultValue(uuid)
      table.text('username').notNullable()
      table.text('email').notNullable().unique()
      table.boolean('email_confirmed').notNullable().defaultValue(false)
      table.timestamptz('email_confirmed_at').nullable()
      table.text('password_hash').notNullable()
      table
        .timestamptz('created_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table
        .timestamptz('updated_at')
        .notNullable()
        .defaultValue(currentTimestamp)
    })
    await schema.createIndex('accounts', [sql`lower("username")`], {
      name: 'accounts_username_key',
      unique: true,
    })

    await addChecks(schema, 'accounts', {
      _uql_accounts__accounts_email_check_cfe0c3: String.raw`"email" = lower("email") AND "email" !~ '\s' AND "email" ~ '^[^@]+@[^@]+\.[^@]+$' AND char_length("email") BETWEEN 3 AND 254`,
      _uql_accounts__accounts_password_hash_check_ba6223:
        'char_length("password_hash") BETWEEN 16 AND 512',
      _uql_accounts__accounts_username_format_1e8ab7: String.raw`"username" ~ '^[A-Za-z0-9_]{3,20}$'`,
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('accounts')
  },
})
