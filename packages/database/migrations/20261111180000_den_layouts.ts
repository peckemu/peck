import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the den layouts table and the eco switches
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('den_layouts', (table) => {
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.integer('den_inv_idx').notNullable()
      table.smallint('ref_id').notNullable()
      table.integer('inv_idx').notNullable()
      table.smallint('category_id').notNullable()
      table.integer('x').notNullable()
      table.integer('y').notNullable()
      table.smallint('flipped').notNullable()
      table.primaryKey(['game_id', 'den_inv_idx', 'ref_id', 'inv_idx'])
    })

    await addChecks(schema, 'den_layouts', {
      _uql_den_layouts__den_layouts_den_inv_idx_check_704cef:
        '"den_inv_idx" >= 0',
      _uql_den_layouts__den_layouts_ref_id_check_661b66:
        '"ref_id" BETWEEN 0 AND 1',
      _uql_den_layouts__den_layouts_category_id_check_65e461:
        '"category_id" > 0',
      _uql_den_layouts__den_layouts_flipped_check_bc1a7f:
        '"flipped" BETWEEN 0 AND 3',
    })

    await schema.addColumn('den_items', (columns) =>
      columns.smallint('eco_consumer_state').notNullable().defaultValue(0),
    )
    await addChecks(schema, 'den_items', {
      _uql_den_items__den_items_eco_consumer_state_check_6b7f32:
        '"eco_consumer_state" BETWEEN 0 AND 2',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.alterTable('den_items', (table) =>
      table.dropColumn('eco_consumer_state'),
    )
    await schema.dropTable('den_layouts')
  },
})
