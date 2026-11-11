import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the permissions table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('permissions', (table) => {
      table.text('key').primaryKey()
      table.text('group').notNullable()
      table.text('label').notNullable()
      table.text('description').notNullable()
      table.integer('position').notNullable()
    })

    await addChecks(schema, 'permissions', {
      _uql_permissions__permissions_key_check_31588e: String.raw`"key" ~ '^[a-z_]+\.[a-z_]+$'`,
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('permissions')
  },
})
