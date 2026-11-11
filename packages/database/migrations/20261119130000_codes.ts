import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

/**
 * Creates the gift code tables
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('codes', (table) => {
      table.text('code').primaryKey()
      table.integer('gems').notNullable().defaultValue(0)
      table.integer('diamonds').notNullable().defaultValue(0)
      table.integer('membership_days').notNullable().defaultValue(0)
      table.jsonb('items').notNullable().defaultValue([])
      table.integer('max_uses').nullable()
      table.integer('uses').notNullable().defaultValue(0)
      table.timestamptz('expires_at').nullable()
      table.boolean('verified_only').notNullable().defaultValue(false)
      table
        .timestamptz('created_at')
        .notNullable()
        .defaultValue(currentTimestamp)
    })

    await schema.createTable('code_redemptions', (table) => {
      table
        .text('code')
        .notNullable()
        .references('codes', 'code')
        .onDelete('CASCADE')
      table
        .uuid('account_id')
        .notNullable()
        .references('accounts', 'id')
        .onDelete('CASCADE')
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table
        .timestamptz('redeemed_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.primaryKey(['code', 'account_id'])
      table.index(['account_id'], 'code_redemptions__account_id_idx')
      table.index(['game_id'], 'code_redemptions__game_id_idx')
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('code_redemptions')
    await schema.dropTable('codes')
  },
})
