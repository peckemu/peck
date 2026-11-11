import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the den shop tables
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('den_shops', (table) => {
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.integer('store_inv_idx').notNullable()
      table.integer('state').notNullable().defaultValue(0)
      table.primaryKey(['game_id', 'store_inv_idx'])
    })

    await schema.createTable('den_shop_listings', (table) => {
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.smallint('item_kind').notNullable()
      table.integer('item_inv_idx').notNullable()
      table.integer('store_inv_idx').notNullable()
      table.smallint('currency').notNullable()
      table.integer('cost').notNullable()
      table
        .timestamptz('listed_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.primaryKey(['game_id', 'item_kind', 'item_inv_idx'])
    })

    await schema.createIndex(
      'den_shop_listings',
      ['game_id', 'store_inv_idx'],
      {
        name: 'den_shop_listings_stand',
      },
    )

    await addChecks(schema, 'den_shops', {
      _uql_den_shops__den_shops_state_check_533131: '"state" >= 0',
    })

    await addChecks(schema, 'den_shop_listings', {
      _uql_den_shop_listings__den_shop_listings_item_ki_74c685_07c19f:
        '"item_kind" >= 0 AND "item_kind" <= 2',
      _uql_den_shop_listings__den_shop_listings_currency_check_3a9c11:
        '"currency" IN (0, 3)',
      _uql_den_shop_listings__den_shop_listings_cost_check_0a17ec: '"cost" > 0',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('den_shop_listings')
    await schema.dropTable('den_shops')
  },
})
