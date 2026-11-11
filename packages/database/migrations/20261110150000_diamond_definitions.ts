import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the diamond definitions table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('diamond_definitions', (table) => {
      table.integer('def_id').primaryKey()
      table.smallint('type').notNullable()
      table.integer('ref_id').notNullable()
      table.integer('cost').notNullable()
      table.smallint('status').notNullable()
      table.timestamptz('available_from').nullable()
      table.timestamptz('available_until').nullable()
    })

    await schema.createIndex('diamond_definitions', ['type', 'ref_id'], {
      name: 'diamond_definitions_ref',
    })

    await addChecks(schema, 'diamond_definitions', {
      _uql_diamond_definitions__diamond_definitions_cost_check_b6b1bb:
        '"cost" >= 0',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('diamond_definitions')
  },
})
