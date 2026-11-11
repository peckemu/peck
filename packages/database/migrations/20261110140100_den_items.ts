import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the den items table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('den_items', (table) => {
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.integer('inv_idx').notNullable()
      table.integer('def_id').notNullable()
      table.smallint('category_id').notNullable().defaultValue(0)
      table.integer('x').notNullable().defaultValue(0)
      table.integer('y').notNullable().defaultValue(0)
      table.boolean('flipped').notNullable().defaultValue(false)
      table.smallint('version').notNullable().defaultValue(0)
      table.integer('den_store_inv_idx').notNullable().defaultValue(0)
      table
        .timestamptz('created_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.primaryKey(['game_id', 'inv_idx'])
    })

    await addChecks(schema, 'den_items', {
      _uql_den_items__den_items_inv_idx_check_1ee80b: '"inv_idx" >= 0',
      _uql_den_items__den_items_category_id_check_2846cc: '"category_id" >= 0',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('den_items')
  },
})
