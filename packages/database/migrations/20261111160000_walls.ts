import { currentTimestamp, uuid } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the Jammer Wall tables
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('walls', (table) => {
      table
        .integer('game_id')
        .primaryKey()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.integer('background').notNullable().defaultValue(19)
      table.text('status').notNullable().defaultValue('')
      table.integer('lang_id').notNullable().defaultValue(0)
      table.jsonb('stickers').notNullable().defaultValue([])
      table.jsonb('masterpieces').notNullable().defaultValue([])
      table.jsonb('photo').nullable()
      table.integer('visits').notNullable().defaultValue(0)
      table.timestamptz('read_at').notNullable().defaultValue(currentTimestamp)
      table
        .timestamptz('changed_at')
        .notNullable()
        .defaultValue(currentTimestamp)
    })

    await schema.createTable('wall_posts', (table) => {
      table.uuid('id').primaryKey().defaultValue(uuid)
      table
        .integer('wall_game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table
        .integer('sender_game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.uuid('parent_id').nullable()
      table.text('message').notNullable()
      table.integer('pattern_id').notNullable()
      table.integer('color_id').notNullable()
      table.integer('localization_id').notNullable()
      table.jsonb('avatar').notNullable()
      table.boolean('notice_read').notNullable().defaultValue(false)
      table
        .timestamptz('posted_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.index(['wall_game_id', 'posted_at'], 'wall_posts_wall')
      table.index(['sender_game_id'], 'wall_posts__sender_game_id_idx')
    })

    await addChecks(schema, 'wall_posts', {
      _uql_wall_posts__wall_posts_message_check_800970:
        'char_length("message") <= 70',
    })

    await schema.createTable('wall_hidden', (table) => {
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.uuid('post_id').notNullable()
      table.primaryKey(['game_id', 'post_id'])
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('wall_hidden')
    await schema.dropTable('wall_posts')
    await schema.dropTable('walls')
  },
})
