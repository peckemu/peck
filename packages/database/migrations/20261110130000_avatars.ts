import { currentTimestamp, sql } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the avatars table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('avatars', (table) => {
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.integer('per_user_av_id').notNullable()
      table.integer('av_inv_id').notNullable()
      table.integer('av_type_id').notNullable()
      table.integer('custom_av_id').notNullable().defaultValue(-1)
      table.bigint('color1').notNullable()
      table.bigint('color2').notNullable()
      table.bigint('color3').notNullable()
      table.text('av_name').notNullable()
      table.integer('eyes_def_id').notNullable()
      table.integer('pattern_def_id').notNullable().defaultValue(0)
      table.integer('quest_level').notNullable().defaultValue(0)
      table.integer('quest_xp').notNullable().defaultValue(0)
      table.boolean('active').notNullable().defaultValue(false)
      table.integer('land_pet_inv_idx').notNullable().defaultValue(0)
      table.integer('ocean_pet_inv_idx').notNullable().defaultValue(0)
      table
        .timestamptz('created_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.primaryKey(['game_id', 'per_user_av_id'])
      table.unique(['game_id', 'av_inv_id'], 'avatars_slot')
    })

    await schema.createIndex('avatars', ['game_id'], {
      name: 'avatars_one_active',
      unique: true,
      where: sql`"active" = true`,
    })

    await addChecks(schema, 'avatars', {
      _uql_avatars__avatars_av_inv_id_check_c94744:
        '"av_inv_id" BETWEEN 0 AND 999',
      _uql_avatars__avatars_per_user_av_id_check_23b71c: '"per_user_av_id" > 0',
      _uql_avatars__avatars_av_name_check_675972:
        'char_length("av_name") BETWEEN 1 AND 60',
      _uql_avatars__avatars_color1_check_7a0dfd:
        '"color1" BETWEEN 0 AND 4294967295',
      _uql_avatars__avatars_color2_check_be7624:
        '"color2" BETWEEN 0 AND 4294967295',
      _uql_avatars__avatars_color3_check_e02ab7:
        '"color3" BETWEEN 0 AND 4294967295',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('avatars')
  },
})
