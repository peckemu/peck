import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the buddy requests table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('buddy_requests', (table) => {
      table
        .integer('from_game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table
        .integer('to_game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table
        .timestamptz('created_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.primaryKey(['from_game_id', 'to_game_id'])
    })

    await schema.createIndex('buddy_requests', ['to_game_id'], {
      name: 'buddy_requests_to',
    })

    await addChecks(schema, 'buddy_requests', {
      _uql_buddy_requests__buddy_requests_self_check_64f2dc:
        '"from_game_id" <> "to_game_id"',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('buddy_requests')
  },
})
