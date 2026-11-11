import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

/**
 * Creates the permission overrides table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('permission_overrides', (table) => {
      table
        .uuid('account_id')
        .notNullable()
        .references('accounts', 'id')
        .onDelete('CASCADE')
      table
        .text('permission')
        .notNullable()
        .references('permissions', 'key')
        .onDelete('CASCADE')
      table.text('effect').notNullable().enum(['grant', 'revoke'])
      table
        .uuid('created_by')
        .nullable()
        .references('accounts', 'id')
        .onDelete('SET NULL')
      table
        .timestamptz('created_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.primaryKey(['account_id', 'permission'])
      table.index(['permission'], 'permission_overrides__permission_idx')
      table.index(['created_by'], 'permission_overrides__created_by_idx')
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('permission_overrides')
  },
})
