import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

/**
 * Creates the transactions table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('transactions', (table) => {
      table.bigint('id').primaryKey().autoIncrement()
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table
        .text('kind')
        .notNullable()
        .enum([
          'eco-credits',
          'eco-gift',
          'photo-booth',
          'buy',
          'bundle',
          'exchange',
          'donation',
          'recycle',
          'den-shop-purchase',
          'den-shop-sale',
          'party-host',
          'pet-salon',
        ])
      table.integer('shop_id').notNullable().defaultValue(0)
      table.integer('diamond_def_id').notNullable().defaultValue(0)
      table.timestamptz('at').notNullable().defaultValue(currentTimestamp)
      table
        .integer('counterpart_game_id')
        .nullable()
        .references('players', 'game_id')
        .onDelete('SET NULL')
      table.index(
        ['game_id', { column: 'at', order: 'desc' }],
        'transactions_player',
      )
      table.index(
        ['counterpart_game_id'],
        'transactions__counterpart_game_id_idx',
      )
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('transactions')
  },
})
