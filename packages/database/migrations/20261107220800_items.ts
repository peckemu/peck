import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the items table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('items', (table) => {
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.integer('inv_id').notNullable()
      table.integer('def_id').notNullable()
      table.bigint('color').notNullable().defaultValue(0)
      table.text('equipped_avatars').notNullable().defaultValue('0')
      table.integer('den_store_inv_idx').notNullable().defaultValue(0)
      table
        .timestamptz('created_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.primaryKey(['game_id', 'inv_id'])
      table.index(['def_id'], 'items_def')
    })
    await addChecks(schema, 'items', {
      _uql_items__items_inv_id_check_390c74: '"inv_id" > 0',
      _uql_items__items_color_check_e50c5e:
        '"color" >= 0 AND "color" <= 4294967295',
      _uql_items__items_equipped_avatars_check_914442: `"equipped_avatars" ~ '^[0-9]+(,[0-9]+)*$'`,
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('items')
  },
})
