import { defineBuilderMigration } from 'uql-orm/migrate'

/**
 * Creates the table of newspapers seen
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('newspaper_seen', (table) => {
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.integer('def_id').notNullable()
      table.bigint('seen_ts').notNullable()
      table.primaryKey(['game_id', 'def_id'])
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('newspaper_seen')
  },
})
