import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the exchange definitions table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('exchange_definitions', (table) => {
      table.integer('def_id').primaryKey()
      table.integer('cost').notNullable()
      table.smallint('currency_type').notNullable()
      table.text('combined_cost').notNullable().defaultValue('')
      table.integer('result').notNullable()
      table.smallint('result_type').notNullable()
      table.timestamptz('available_from').nullable()
      table.timestamptz('available_until').nullable()
    })

    await addChecks(schema, 'exchange_definitions', {
      _uql_exchange_definitions__exchange_definitions_c_a873da_b6b1bb:
        '"cost" >= 0',
      _uql_exchange_definitions__exchange_definitions_r_9a3e8e_50cd87:
        '"result" >= 0',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('exchange_definitions')
  },
})
