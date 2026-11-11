import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the adventure tables
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('quest_definitions', (table) => {
      table.integer('def_id').primaryKey()
      table.integer('title_str_id').notNullable().defaultValue(0)
      table.integer('room_def_id').notNullable().defaultValue(0)
      table.smallint('avatar_limit').notNullable().defaultValue(4)
      table.smallint('avatar_min').notNullable().defaultValue(1)
      table.smallint('level_min').notNullable().defaultValue(0)
      table.smallint('hard_level_min').notNullable().defaultValue(0)
      table.boolean('members_only').notNullable().defaultValue(false)
      table.smallint('avatar_type').notNullable().defaultValue(0)
      table.jsonb('actors').notNullable()
      table.jsonb('gifts').notNullable()
      table.text('gift_actor').notNullable().defaultValue('')
      table.smallint('popup_type').notNullable().defaultValue(0)
      table.integer('crystal_goal').notNullable().defaultValue(0)
      table.text('music').notNullable().defaultValue('')
      table.jsonb('sound_packs').notNullable()
    })

    await schema.createTable('quest_completions', (table) => {
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.integer('def_id').notNullable()
      table.smallint('difficulty').notNullable()
      table.integer('times').notNullable().defaultValue(0)
      table.timestamptz('first_at').notNullable().defaultValue(currentTimestamp)
      table.timestamptz('last_at').notNullable().defaultValue(currentTimestamp)
      table.primaryKey(['game_id', 'def_id', 'difficulty'])
    })

    await schema.createTable('quest_prizes', (table) => {
      table.bigint('id').primaryKey().autoIncrement()
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.integer('def_id').notNullable()
      table.smallint('kind').notNullable()
      table.integer('value').notNullable()
      table.bigint('color').notNullable().defaultValue(0)
      table.timestamptz('won_at').notNullable().defaultValue(currentTimestamp)
    })

    await schema.createIndex('quest_prizes', ['game_id'], {
      name: 'quest_prizes__game_id_idx',
    })

    await addChecks(schema, 'quest_completions', {
      _uql_quest_completions__quest_completions_times_check_f401da:
        '"times" >= 0',
    })
    await addChecks(schema, 'quest_prizes', {
      _uql_quest_prizes__quest_prizes_color_check_e50c5e:
        '"color" >= 0 AND "color" <= 4294967295',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('quest_prizes')
    await schema.dropTable('quest_completions')
    await schema.dropTable('quest_definitions')
  },
})
