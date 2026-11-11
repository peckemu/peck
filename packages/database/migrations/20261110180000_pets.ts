import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the pets table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('pets', (table) => {
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.integer('inv_idx').notNullable()
      table.bigint('created_ts').notNullable()
      table.text('name').notNullable()
      table.bigint('l_bits').notNullable()
      table.bigint('u_bits').notNullable().defaultValue(0)
      table.bigint('e_bits').notNullable().defaultValue(0)
      table.bigint('mastery_counter').notNullable().defaultValue(0)
      table.integer('personality_def_id').notNullable().defaultValue(0)
      table.integer('favorite_toy_def_id').notNullable().defaultValue(0)
      table.integer('favorite_food_def_id').notNullable().defaultValue(0)
      table.integer('den_store_inv_idx').notNullable().defaultValue(0)
      table.smallint('den_category_id').notNullable().defaultValue(0)
      table.integer('den_x').notNullable().defaultValue(0)
      table.integer('den_y').notNullable().defaultValue(0)
      table.smallint('den_flipped').notNullable().defaultValue(0)
      table.primaryKey(['game_id', 'inv_idx'])
    })

    await addChecks(schema, 'pets', {
      _uql_pets__pets_inv_idx_check_00bafc: '"inv_idx" > 0',
      _uql_pets__pets_name_check_38a03d: 'char_length("name") <= 60',
      _uql_pets__pets_l_bits_check_437ae4:
        '"l_bits" >= 0 AND "l_bits" <= 4294967295',
      _uql_pets__pets_u_bits_check_b8e554:
        '"u_bits" >= 0 AND "u_bits" <= 4294967295',
      _uql_pets__pets_e_bits_check_01e474:
        '"e_bits" >= 0 AND "e_bits" <= 4294967295',
      _uql_pets__pets_den_flipped_check_93904e:
        '"den_flipped" >= 0 AND "den_flipped" <= 3',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('pets')
  },
})
