import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the command settings table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('command_settings', (table) => {
      table
        .integer('game_id')
        .primaryKey()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.jsonb('room_themes').notNullable().defaultValue({})
      table.boolean('random_themes').notNullable().defaultValue(false)
      table.boolean('hide_blocked').notNullable().defaultValue(false)
      table.text('den_name').nullable()
      table.jsonb('last_purchase').nullable()
      table.boolean('staff_look').notNullable().defaultValue(true)
      table
        .timestamptz('updated_at')
        .notNullable()
        .defaultValue(currentTimestamp)
    })

    await addChecks(schema, 'command_settings', {
      _uql_command_settings__command_settings_room_them_4fb6d9_4ea730: String.raw`jsonb_typeof("room_themes") = 'object'`,
      _uql_command_settings__command_settings_last_purc_1e6415_cf6d4a: String.raw`"last_purchase" IS NULL OR jsonb_typeof("last_purchase") = 'object'`,
      _uql_command_settings__command_settings_den_name_check_18dd2e:
        '"den_name" IS NULL OR length("den_name") BETWEEN 1 AND 24',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('command_settings')
  },
})
