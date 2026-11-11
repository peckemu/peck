import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

/**
 * Creates the account roles table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('account_roles', (table) => {
      table
        .uuid('account_id')
        .primaryKey()
        .references('accounts', 'id')
        .onDelete('CASCADE')
      table.uuid('role_id').notNullable().references('roles', 'id')
      table
        .uuid('granted_by')
        .nullable()
        .references('accounts', 'id')
        .onDelete('SET NULL')
      table
        .timestamptz('granted_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.index(['role_id'], 'account_roles__role_id_idx')
      table.index(['granted_by'], 'account_roles__granted_by_idx')
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('account_roles')
  },
})
