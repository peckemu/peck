import { currentTimestamp, uuid } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

/**
 * Creates the audit log table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('audit_log', (table) => {
      table.uuid('id').primaryKey().defaultValue(uuid)
      table.timestamptz('at').notNullable().defaultValue(currentTimestamp)
      table
        .uuid('actor_id')
        .nullable()
        .references('accounts', 'id')
        .onDelete('SET NULL')
      table
        .text('action')
        .notNullable()
        .enum([
          'role.created',
          'role.updated',
          'role.deleted',
          'member.role_changed',
          'override.granted',
          'override.revoked',
          'override.removed',
        ])
      table.text('target_kind').notNullable().enum(['account', 'role'])
      table.text('target_id').notNullable()
      table.text('target_name').notNullable().defaultValue('')
      table.jsonb('detail').notNullable().defaultValue({})
      table.index([{ column: 'at', order: 'desc' }], 'audit_log_at_index')
      table.index(['actor_id'], 'audit_log__actor_id_idx')
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('audit_log')
  },
})
