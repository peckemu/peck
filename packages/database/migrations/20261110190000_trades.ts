import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the trade tables
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('trade_list', (table) => {
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.smallint('item_kind').notNullable()
      table.integer('inv_idx').notNullable()
      table.timestamptz('added_at').notNullable().defaultValue(currentTimestamp)
      table.primaryKey(['game_id', 'item_kind', 'inv_idx'])
    })

    await schema.createTable('trades', (table) => {
      table.bigint('id').primaryKey().autoIncrement()
      table
        .integer('from_game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table
        .integer('to_game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.timestamptz('at').notNullable().defaultValue(currentTimestamp)
    })

    await schema.createIndex('trades', ['from_game_id'], {
      name: 'trades_from',
    })
    await schema.createIndex('trades', ['to_game_id'], { name: 'trades_to' })

    await schema.createTable('trade_items', (table) => {
      table
        .bigint('trade_id')
        .notNullable()
        .references('trades', 'id')
        .onDelete('CASCADE')
      table.integer('from_game_id').notNullable()
      table.smallint('item_kind').notNullable()
      table.integer('inv_idx').notNullable()
      table.integer('given_inv_idx').notNullable()
      table.integer('def_id').notNullable()
      table.bigint('color').notNullable().defaultValue(0)
      table.smallint('version').notNullable().defaultValue(0)
      table.bigint('l_bits').notNullable().defaultValue(0)
      table.bigint('u_bits').notNullable().defaultValue(0)
      table.bigint('e_bits').notNullable().defaultValue(0)
      table.primaryKey(['trade_id', 'from_game_id', 'item_kind', 'inv_idx'])
    })

    await addChecks(schema, 'trade_list', {
      _uql_trade_list__trade_list_item_kind_check_07c19f:
        '"item_kind" >= 0 AND "item_kind" <= 2',
    })
    await addChecks(schema, 'trade_items', {
      _uql_trade_items__trade_items_item_kind_check_07c19f:
        '"item_kind" >= 0 AND "item_kind" <= 2',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('trade_items')
    await schema.dropTable('trades')
    await schema.dropTable('trade_list')
  },
})
