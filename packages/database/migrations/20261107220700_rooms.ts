import { defineBuilderMigration } from 'uql-orm/migrate'

/**
 * Creates the rooms table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('rooms', (table) => {
      table.integer('def_id').primaryKey()
      table.text('name').notNullable().unique()
      table.smallint('enviro_type').notNullable()
      table.boolean('platformer').notNullable().defaultValue(false)
      table.smallint('capacity').notNullable().defaultValue(30)
      table.text('display_name').notNullable()
      table.integer('name_id').notNullable().defaultValue(0)
      table.text('sent_name').nullable()
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('rooms')
  },
})
