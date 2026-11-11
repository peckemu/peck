import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the den item definitions table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('den_item_definitions', (table) => {
      table.integer('def_id').primaryKey()
      table.text('name').nullable()
      table.text('abbr_name').notNullable()
      table.integer('name_str_id').notNullable()
      table.smallint('special_type').notNullable()
      table.integer('cost').notNullable()
      table.smallint('currency_type').notNullable()
      table.text('combined_cost').notNullable()
      table.integer('recycle_value').notNullable()
      table.boolean('members_only').notNullable()
      table.smallint('status').notNullable()
      table.smallint('sort_cat').notNullable()
      table.smallint('type_cat').notNullable()
      table.smallint('enviro_type').notNullable()
      table.smallint('layer').notNullable()
      table.smallint('flag').notNullable()
      table.integer('game_def_id').notNullable()
      table.integer('list_id').notNullable()
      table.integer('mannequin_avatar_def_id').notNullable()
      table.integer('mannequin_cat_id').notNullable()
      table.integer('parent_array_id').notNullable()
      table.smallint('promo_type').notNullable()
      table.smallint('scale_percent').notNullable()
      table.smallint('eco_power').notNullable()
      table.timestamptz('available_from').nullable()
      table.timestamptz('available_until').nullable()
    })

    await addChecks(schema, 'den_item_definitions', {
      _uql_den_item_definitions__den_item_definitions_c_b21682_b6b1bb:
        '"cost" >= 0',
      _uql_den_item_definitions__den_item_definitions_r_0e975c_cdc6e3:
        '"recycle_value" >= 0',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('den_item_definitions')
  },
})
