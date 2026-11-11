import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the shop stock table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('shop_stock', (table) => {
      table.integer('list_id').notNullable()
      table.integer('list_type').notNullable()
      table.integer('def_id').notNullable()
      table.integer('position').notNullable().defaultValue(0)
      table.primaryKey(['list_id', 'list_type', 'def_id'])
    })

    await addChecks(schema, 'shop_stock', {
      _uql_shop_stock__shop_stock_position_check_7aee25: '"position" >= 0',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('shop_stock')
  },
})
