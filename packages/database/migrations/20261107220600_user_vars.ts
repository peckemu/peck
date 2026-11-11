import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the user variables table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('user_vars', (table) => {
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.integer('var_id').notNullable()
      table.smallint('type').notNullable().defaultValue(0)
      table.double('value').notNullable()
      table
        .timestamptz('updated_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.primaryKey(['game_id', 'var_id'])
    })
    await addChecks(schema, 'user_vars', {
      _uql_user_vars__user_vars_var_id_check_6d79e6: '"var_id" > 0',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('user_vars')
  },
})
