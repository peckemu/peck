import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the achievements table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('achievements', (table) => {
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.integer('inv_id').notNullable()
      table.integer('def_id').notNullable()
      table
        .timestamptz('earned_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.primaryKey(['game_id', 'inv_id'])
      table.unique(['game_id', 'def_id'], 'achievements_once')
    })

    await addChecks(schema, 'achievements', {
      _uql_achievements__achievements_inv_check_390c74: '"inv_id" > 0',
      _uql_achievements__achievements_def_check_973cf0: '"def_id" > 0',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('achievements')
  },
})
