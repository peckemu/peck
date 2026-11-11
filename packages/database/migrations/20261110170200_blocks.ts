import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the blocks table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('blocks', (table) => {
      table
        .integer('blocker_game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table
        .integer('blocked_game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table
        .timestamptz('created_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.primaryKey(['blocker_game_id', 'blocked_game_id'])
    })

    await schema.createIndex('blocks', ['blocked_game_id'], {
      name: 'blocks_blocked',
    })

    await addChecks(schema, 'blocks', {
      _uql_blocks__blocks_self_check_d2a5eb:
        '"blocker_game_id" <> "blocked_game_id"',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('blocks')
  },
})
