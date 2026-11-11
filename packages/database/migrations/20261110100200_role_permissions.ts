import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

/**
 * Creates the role permissions table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('role_permissions', (table) => {
      table
        .uuid('role_id')
        .notNullable()
        .references('roles', 'id')
        .onDelete('CASCADE')
      table
        .text('permission')
        .notNullable()
        .references('permissions', 'key')
        .onDelete('CASCADE')
      table
        .uuid('granted_by')
        .nullable()
        .references('accounts', 'id')
        .onDelete('SET NULL')
      table
        .timestamptz('granted_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.primaryKey(['role_id', 'permission'])
      table.index(['permission'], 'role_permissions__permission_idx')
      table.index(['granted_by'], 'role_permissions__granted_by_idx')
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('role_permissions')
  },
})
