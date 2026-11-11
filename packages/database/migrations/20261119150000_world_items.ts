import { defineBuilderMigration } from 'uql-orm/migrate'

/**
 * Creates the world item definitions table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('world_item_definitions', (table) => {
      table.integer('def_id').primaryKey()
      table.smallint('gift_type').notNullable()
      table.integer('gift_ref_id').notNullable()
      table.integer('amount').notNullable()
      table.integer('position').notNullable()
      table.integer('user_var_ref_id').notNullable()
      table.smallint('uv_index').notNullable()
      table.timestamptz('available_from').nullable()
      table.timestamptz('available_until').nullable()
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('world_item_definitions')
  },
})
