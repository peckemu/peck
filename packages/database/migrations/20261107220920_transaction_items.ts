import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the transaction items table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('transaction_items', (table) => {
      table
        .bigint('transaction_id')
        .notNullable()
        .references('transactions', 'id')
        .onDelete('CASCADE')
      table.smallint('seq').notNullable()
      table
        .text('item_kind')
        .notNullable()
        .enum(['clothing', 'den-item', 'den-room', 'pet'])
      table.integer('inv_idx').notNullable()
      table.integer('def_id').notNullable()
      table.bigint('color').notNullable().defaultValue(0)
      table.smallint('version').notNullable().defaultValue(0)
      table.integer('gems').notNullable().defaultValue(0)
      table.bigint('l_bits').notNullable().defaultValue(0)
      table.bigint('u_bits').notNullable().defaultValue(0)
      table.bigint('e_bits').notNullable().defaultValue(0)
      table.primaryKey(['transaction_id', 'seq'])
    })
    await addChecks(schema, 'transaction_items', {
      _uql_transaction_items__transaction_items_seq_check_4c5ebf: '"seq" >= 0',
      _uql_transaction_items__transaction_items_gems_check_bf5d22:
        '"gems" >= 0',
      _uql_transaction_items__transaction_items_color_check_e50c5e:
        '"color" >= 0 AND "color" <= 4294967295',
      _uql_transaction_items__transaction_items_l_bits_check_437ae4:
        '"l_bits" >= 0 AND "l_bits" <= 4294967295',
      _uql_transaction_items__transaction_items_u_bits_check_b8e554:
        '"u_bits" >= 0 AND "u_bits" <= 4294967295',
      _uql_transaction_items__transaction_items_e_bits_check_01e474:
        '"e_bits" >= 0 AND "e_bits" <= 4294967295',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('transaction_items')
  },
})
