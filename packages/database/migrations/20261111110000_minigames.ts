import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the minigame tables
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('minigame_definitions', (table) => {
      table.integer('def_id').primaryKey()
      table.integer('title_str_id').notNullable()
      table.text('ext_name').notNullable()
      table.text('swf_name').notNullable()
      table.integer('min_players').notNullable()
      table.integer('max_players').notNullable()
      table.integer('max_spectators').notNullable()
      table.integer('type').notNullable()
      table.integer('game_card_media_id').notNullable()
      table.integer('game_count_user_var_ref').notNullable()
      table.integer('custom1_user_var_ref').notNullable()
      table.integer('custom2_user_var_ref').notNullable()
      table.boolean('ready_for_pvp').notNullable()
      table.double('gem_multiplier').notNullable()
      table.integer('pet_def_id').notNullable()
      table.integer('pro_mode_user_var_ref_id').notNullable()
      table.integer('leaderboard_user_var_ref').notNullable()
      table.integer('game_library_icon_media_id').notNullable()
      table.integer('required_avatar_type').notNullable()
    })

    await schema.createTable('minigame_days', (table) => {
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.text('day').notNullable()
      table.integer('game_def_id').notNullable()
      table.integer('plays').notNullable().defaultValue(0)
      table.integer('gems').notNullable().defaultValue(0)
      table.integer('mastery').notNullable().defaultValue(0)
      table.primaryKey(['game_id', 'day', 'game_def_id'])
    })

    await schema.createTable('minigame_scores', (table) => {
      table.bigint('id').primaryKey().autoIncrement()
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.integer('game_def_id').notNullable()
      table.integer('score').notNullable()
      table.timestamptz('at').notNullable().defaultValue(currentTimestamp)
    })

    await schema.createIndex('minigame_scores', ['game_def_id', 'score'], {
      name: 'minigame_scores_board',
    })
    await schema.createIndex('minigame_scores', ['game_id'], {
      name: 'minigame_scores__game_id_idx',
    })

    await addChecks(schema, 'minigame_days', {
      _uql_minigame_days__minigame_days_plays_check_026c13: '"plays" >= 0',
      _uql_minigame_days__minigame_days_gems_check_bf5d22: '"gems" >= 0',
    })
    await addChecks(schema, 'minigame_scores', {
      _uql_minigame_scores__minigame_scores_score_check_5fb08e:
        '"score" >= 0 AND "score" <= 9999999',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('minigame_scores')
    await schema.dropTable('minigame_days')
    await schema.dropTable('minigame_definitions')
  },
})
