import { defineBuilderMigration } from 'uql-orm/migrate'

/**
 * Creates the generic list definitions table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('generic_list_definitions', (table) => {
      table.integer('def_id').primaryKey()
      table.integer('type').notNullable()
      table.integer('diamond_cost').notNullable()
      table.boolean('diamond_bundle').notNullable()
      table.jsonb('ids').notNullable()
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('generic_list_definitions')
  },
})
