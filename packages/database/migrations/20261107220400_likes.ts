import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the likes table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('likes', (table) => {
      table
        .text('resource_type')
        .notNullable()
        .enum(['masterpiece', 'jammerwall'])
      table.text('resource_id').notNullable()
      table
        .integer('liker_game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.timestamptz('at').notNullable().defaultValue(currentTimestamp)
      table.primaryKey(['resource_type', 'resource_id', 'liker_game_id'])
      table.index(['liker_game_id'], 'likes__liker_game_id_idx')
    })

    await addChecks(schema, 'likes', {
      _uql_likes__likes_resource_id_check_fbfa50:
        'length("resource_id") <= 100',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('likes')
  },
})
