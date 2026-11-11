import { AccountType } from '@peck/shared'
import { currentTimestamp, sql, uuid } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * The starting flags
 */
const PENDING_FLAGS = 1 | 2 | 16

/**
 * Creates the players table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('players', (table) => {
      table.integer('game_id').primaryKey().autoIncrement()
      table
        .uuid('account_id')
        .notNullable()
        .references('accounts', 'id')
        .onDelete('CASCADE')
      table.uuid('uuid').notNullable().unique().defaultValue(uuid)
      table.text('username').notNullable()
      table.smallint('slot').notNullable().defaultValue(1)
      table
        .timestamptz('created_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.timestamptz('last_login_at').nullable()
      table.integer('num_logins').notNullable().defaultValue(0)
      table
        .smallint('account_type')
        .notNullable()
        .defaultValue(AccountType.Member)
      for (const currency of [
        'gems',
        'tickets',
        'orbs',
        'diamonds',
        'straw',
        'bamboo',
        'wood',
        'stone',
        'silver',
        'gold',
        'gemstone',
        'eco_credits',
      ]) {
        table.integer(currency).notNullable().defaultValue(0)
      }
      table.smallint('eco_unredeemed').notNullable().defaultValue(0)
      table.timestamptz('eco_accrued_at').nullable()
      table.integer('pending_flags').notNullable().defaultValue(PENDING_FLAGS)
      table.smallint('chat_type').notNullable().defaultValue(1)
      table.smallint('chat_type_non_degraded').notNullable().defaultValue(1)
      table.integer('interactions').notNullable().defaultValue(1023)
      table.integer('name_bar_data').notNullable().defaultValue(0)
      table.text('name_bar_style').notNullable().defaultValue('')
      table.text('balloon_style').notNullable().defaultValue('')
      table.smallint('den_privacy').notNullable().defaultValue(0)
      table.smallint('ecard_privacy').notNullable().defaultValue(1)
      table.smallint('wall_settings').notNullable().defaultValue(1)
      table.smallint('wall_status').notNullable().defaultValue(1)
      table
        .bigint('avatar_slot_flags')
        .notNullable()
        .defaultValue(4_294_967_295)
      table.integer('active_den_inv_idx').notNullable().defaultValue(0)
      table.text('unlocked_pets').notNullable().defaultValue('0')
      table.smallint('daily_gift_index').notNullable().defaultValue(0)
      table.integer('next_item_inv_id').notNullable().defaultValue(1)
      table.integer('next_den_item_inv_idx').notNullable().defaultValue(1)
      table.integer('next_pet_inv_idx').notNullable().defaultValue(1)
      table.boolean('profile_public').notNullable().defaultValue(true)
      table.boolean('sign_in_notices').notNullable().defaultValue(true)
      table.unique(['account_id', 'slot'], 'players_account_slot')
    })
    await schema.createIndex('players', [sql`lower("username")`], {
      name: 'players_username',
      unique: true,
    })
    await addChecks(schema, 'players', {
      _uql_players__players_gems_check_bf5d22: '"gems" >= 0',
      _uql_players__players_num_logins_check_4f03b9: '"num_logins" >= 0',
      _uql_players__players_tickets_check_a8c03d: '"tickets" >= 0',
      _uql_players__players_orbs_check_89de78: '"orbs" >= 0',
      _uql_players__players_diamonds_check_29583f: '"diamonds" >= 0',
      _uql_players__players_straw_check_0ae37f: '"straw" >= 0',
      _uql_players__players_bamboo_check_79f1f6: '"bamboo" >= 0',
      _uql_players__players_wood_check_164f8b: '"wood" >= 0',
      _uql_players__players_stone_check_076d75: '"stone" >= 0',
      _uql_players__players_silver_check_f41123: '"silver" >= 0',
      _uql_players__players_gold_check_ad24d8: '"gold" >= 0',
      _uql_players__players_gemstone_check_b6867e: '"gemstone" >= 0',
      _uql_players__players_eco_credits_check_9aa784: '"eco_credits" >= 0',
      _uql_players__players_wall_settings_check_db9354:
        '"wall_settings" BETWEEN 0 AND 2',
      _uql_players__players_wall_status_check_f17b1d: '"wall_status" IN (0, 1)',
      _uql_players__players_avatar_slot_flags_check_19251f:
        '"avatar_slot_flags" BETWEEN 0 AND 4294967295',
      _uql_players__players_unlocked_pets_check_e73678: String.raw`"unlocked_pets" ~ '^[0-9]+(,[0-9]+)*$'`,
      _uql_players__players_next_item_inv_id_check_d1885a:
        '"next_item_inv_id" > 0',
      _uql_players__players_next_den_item_inv_idx_check_b4eea2:
        '"next_den_item_inv_idx" > 0',
      _uql_players__players_next_pet_inv_idx_check_bb44ae:
        '"next_pet_inv_idx" > 0',
      _uql_players__players_eco_unredeemed_check_205a56:
        '"eco_unredeemed" BETWEEN 0 AND 240',
      _uql_players__players_slot_check_6252c9: '"slot" >= 1',
      _uql_players__players_name_bar_style_check_e4d37e: String.raw`char_length("name_bar_style") <= 80 AND "name_bar_style" ~ '^[a-z0-9.-]*$'`,
      _uql_players__players_balloon_style_check_429dd2: String.raw`char_length("balloon_style") <= 120 AND "balloon_style" ~ '^[a-z0-9._-]*$'`,
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('players')
  },
})
