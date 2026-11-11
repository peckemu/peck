import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the eco gifts table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('eco_gifts', (table) => {
      table.smallint('bit_idx').primaryKey()
      table.integer('score_required').notNullable()
      table.integer('den_item_def_id').notNullable()
      table.smallint('color').notNullable().defaultValue(0)
      table.integer('name_str_id').notNullable().defaultValue(0)
      table.integer('desc_str_id').notNullable().defaultValue(0)
    })
    await addChecks(schema, 'eco_gifts', {
      _uql_eco_gifts__eco_gifts_bit_idx_check_f78086:
        '"bit_idx" >= 0 AND "bit_idx" <= 30',
      _uql_eco_gifts__eco_gifts_score_required_check_9e0fdc:
        '"score_required" >= 0',
      _uql_eco_gifts__eco_gifts_den_item_def_id_check_01a0e6:
        '"den_item_def_id" > 0',
      _uql_eco_gifts__eco_gifts_color_check_f2762b:
        '"color" >= 0 AND "color" <= 255',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('eco_gifts')
  },
})
