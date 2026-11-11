import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the buddies table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('buddies', (table) => {
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table
        .integer('buddy_game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table
        .timestamptz('created_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.primaryKey(['game_id', 'buddy_game_id'])
    })

    await schema.createIndex('buddies', ['buddy_game_id'], {
      name: 'buddies_buddy',
    })

    await addChecks(schema, 'buddies', {
      _uql_buddies__buddies_self_check_41b5f2: '"game_id" <> "buddy_game_id"',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('buddies')
  },
})
