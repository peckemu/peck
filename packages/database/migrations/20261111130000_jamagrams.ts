import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the Jam-a-Gram table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('jamagrams', (table) => {
      table.bigint('id').primaryKey().autoIncrement()
      table
        .integer('to_game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table
        .integer('from_game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.integer('card_media_id').notNullable()
      table.integer('stamp_media_id').notNullable().defaultValue(0)
      table.text('message').notNullable()
      table.smallint('message_type').notNullable()
      table.smallint('type').notNullable()
      table.integer('gift_id').notNullable().defaultValue(0)
      table.bigint('gift_color').notNullable().defaultValue(0)
      table.text('gift_name').notNullable().defaultValue('')
      table.smallint('gift_version').notNullable().defaultValue(0)
      table.boolean('gift_kept').nullable()
      table.smallint('special_type').notNullable().defaultValue(0)
      table.boolean('read').notNullable().defaultValue(false)
      table.timestamptz('sent_at').notNullable().defaultValue(currentTimestamp)
      table.timestamptz('deleted_at').nullable()
    })

    await schema.createIndex('jamagrams', ['to_game_id', 'id'], {
      name: 'jamagrams_inbox',
    })
    await schema.createIndex('jamagrams', ['from_game_id'], {
      name: 'jamagrams__from_game_id_idx',
    })

    await addChecks(schema, 'jamagrams', {
      _uql_jamagrams__jamagrams_message_check_fb27b6:
        'char_length("message") <= 500',
      _uql_jamagrams__jamagrams_gift_color_check_341774:
        '"gift_color" >= 0 AND "gift_color" <= 4294967295',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('jamagrams')
  },
})
