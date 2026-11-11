import { defineBuilderMigration } from 'uql-orm/migrate'

/**
 * Creates the generic list contents table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('generic_list_contents', (table) => {
      table.integer('list_id').primaryKey()
      table.jsonb('fields').notNullable()
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('generic_list_contents')
  },
})
