import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the item definitions table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('item_definitions', (table) => {
      table.integer('def_id').primaryKey()
      table.text('name').nullable()
      table.integer('acc_id').notNullable()
      table.smallint('layer_id').notNullable()
      table.integer('title_str_id').notNullable()
      table.smallint('type').notNullable()
      table.integer('cost').notNullable()
      table.smallint('currency_type').notNullable()
      table.text('combined_cost').notNullable().defaultValue('')
      table.integer('recycle_value').notNullable()
      table.smallint('status').notNullable()
      table.boolean('giftable').notNullable().defaultValue(false)
      table.boolean('members_only').notNullable().defaultValue(false)
      table.smallint('enviro_type').notNullable()
      table.bigint('avatar_use_flags').notNullable()
      table.jsonb('colors').notNullable()
      table.smallint('defense').notNullable().defaultValue(0)
      table.smallint('attack').notNullable().defaultValue(0)
      table.integer('attack_media_ref_id').notNullable().defaultValue(0)
      table.smallint('combat_type').notNullable().defaultValue(0)
      table.smallint('modifier_type').notNullable().defaultValue(0)
      table.smallint('modifier_value').notNullable().defaultValue(0)
      table.smallint('critical_hit').notNullable().defaultValue(0)
      table.timestamptz('available_from').nullable()
      table.timestamptz('available_until').nullable()
    })

    await addChecks(schema, 'item_definitions', {
      _uql_item_definitions__item_definitions_cost_check_b6b1bb: '"cost" >= 0',
      _uql_item_definitions__item_definitions_recycle_v_ec735c_cdc6e3:
        '"recycle_value" >= 0',
      _uql_item_definitions__item_definitions_enviro_ty_4d6431_31bf92:
        '"enviro_type" BETWEEN 0 AND 2',
      _uql_item_definitions__item_definitions_colors_check_85fe0a: `jsonb_typeof("colors") = 'array'`,
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('item_definitions')
  },
})
