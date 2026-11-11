import { currentTimestamp, sql } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the item prizes table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('item_prizes', (table) => {
      table.bigint('id').primaryKey().autoIncrement()
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.integer('user_var_id').notNullable()
      table.integer('den_item_def_id').notNullable()
      table.smallint('color').notNullable().defaultValue(0)
      table.integer('name_str_id').notNullable().defaultValue(0)
      table.integer('desc_str_id').notNullable().defaultValue(0)
      table.text('source').notNullable().enum(['eco-gift'])
      table.integer('source_ref').notNullable().defaultValue(0)
      table
        .timestamptz('offered_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.timestamptz('answered_at').nullable()
      table.boolean('kept').nullable()
      table.index(['game_id'], 'item_prizes__game_id_idx')
    })
    await schema.createIndex('item_prizes', ['game_id', 'user_var_id'], {
      name: 'item_prizes_waiting',
      unique: true,
      where: sql`"answered_at" IS NULL`,
    })
    await addChecks(schema, 'item_prizes', {
      _uql_item_prizes__item_prizes_user_var_id_check_b8e510:
        '"user_var_id" > 0',
      _uql_item_prizes__item_prizes_den_item_def_id_check_01a0e6:
        '"den_item_def_id" > 0',
      _uql_item_prizes__item_prizes_color_check_f2762b:
        '"color" >= 0 AND "color" <= 255',
      _uql_item_prizes__item_prizes_answered_check_1cba87:
        '("answered_at" IS NULL) = ("kept" IS NULL)',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('item_prizes')
  },
})
