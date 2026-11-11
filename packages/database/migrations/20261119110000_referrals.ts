import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the referral tables
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('referrals', (table) => {
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table
        .integer('referrer_game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table
        .timestamptz('created_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.primaryKey(['game_id'])
    })

    await schema.createIndex('referrals', ['referrer_game_id'], {
      name: 'referrals_referrer',
    })

    await addChecks(schema, 'referrals', {
      _uql_referrals__referrals_self_check_0e1d11:
        '"game_id" <> "referrer_game_id"',
    })

    await schema.createTable('referral_levels', (table) => {
      table.smallint('level').primaryKey()
      table.integer('referrals').notNullable()
      table.text('code').nullable()
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('referral_levels')
    await schema.dropTable('referrals')
  },
})
