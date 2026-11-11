import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the pet definitions table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('pet_definitions', (table) => {
      table.integer('def_id').primaryKey()
      table.text('name').nullable()
      table.integer('title_str_id').notNullable()
      table.integer('media_ref_id').notNullable()
      table.smallint('type').notNullable()
      table.boolean('members_only').notNullable()
      table.integer('cost').notNullable()
      table.smallint('status').notNullable()
      table.integer('toy_list_id').notNullable()
      table.integer('food_list_id').notNullable()
      table.boolean('reward').notNullable()
      table.boolean('egg').notNullable()
      table.timestamptz('available_from').nullable()
      table.timestamptz('available_until').nullable()
    })

    await addChecks(schema, 'pet_definitions', {
      _uql_pet_definitions__pet_definitions_cost_check_b6b1bb: '"cost" >= 0',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('pet_definitions')
  },
})
