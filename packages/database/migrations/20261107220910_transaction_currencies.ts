import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the transaction currencies table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('transaction_currencies', (table) => {
      table
        .bigint('transaction_id')
        .notNullable()
        .references('transactions', 'id')
        .onDelete('CASCADE')
      table.smallint('currency').notNullable()
      table.integer('change').notNullable()
      table.integer('balance').notNullable()
      table.primaryKey(['transaction_id', 'currency'])
    })
    await addChecks(schema, 'transaction_currencies', {
      _uql_transaction_currencies__transaction_currenci_9f7640_e7ebbb:
        '"currency" >= 0 AND "currency" <= 11',
      _uql_transaction_currencies__transaction_currenci_6f48b7_aaf090:
        '"balance" >= 0',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('transaction_currencies')
  },
})
