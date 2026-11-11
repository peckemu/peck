import { currentTimestamp, uuid } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the reports and sanctions tables
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('reports', (table) => {
      table.uuid('id').primaryKey().defaultValue(uuid)
      table
        .integer('reporter_game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table
        .integer('reported_game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.integer('reason_id').notNullable()
      table.integer('data_type').notNullable().defaultValue(0)
      table.text('data').notNullable().defaultValue('')
      table.text('room_name').notNullable().defaultValue('')
      table.text('status').notNullable().defaultValue('open')
      table
        .timestamptz('created_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.timestamptz('resolved_at').nullable()
      table
        .uuid('resolved_by')
        .nullable()
        .references('accounts', 'id')
        .onDelete('SET NULL')
      table.index(['status', 'created_at'], 'reports_status')
      table.index(['reporter_game_id'], 'reports__reporter_game_id_idx')
      table.index(['reported_game_id'], 'reports__reported_game_id_idx')
      table.index(['resolved_by'], 'reports__resolved_by_idx')
    })

    await addChecks(schema, 'reports', {
      _uql_reports__status_c96d79: `"status" IN ('open', 'resolved')`,
    })

    await schema.createTable('sanctions', (table) => {
      table.uuid('id').primaryKey().defaultValue(uuid)
      table
        .uuid('account_id')
        .notNullable()
        .references('accounts', 'id')
        .onDelete('CASCADE')
      table
        .integer('game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.text('kind').notNullable()
      table.integer('reason_id').notNullable().defaultValue(0)
      table.text('note').notNullable().defaultValue('')
      table
        .uuid('actor_id')
        .nullable()
        .references('accounts', 'id')
        .onDelete('SET NULL')
      table
        .timestamptz('created_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.timestamptz('expires_at').nullable()
      table.timestamptz('lifted_at').nullable()
      table
        .uuid('lifted_by')
        .nullable()
        .references('accounts', 'id')
        .onDelete('SET NULL')
      table.index(['account_id', 'kind'], 'sanctions_account')
      table.index(['game_id'], 'sanctions__game_id_idx')
      table.index(['actor_id'], 'sanctions__actor_id_idx')
      table.index(['lifted_by'], 'sanctions__lifted_by_idx')
    })

    await addChecks(schema, 'sanctions', {
      _uql_sanctions__kind_c77773: `"kind" IN ('ban', 'mute')`,
    })

    await schema.raw(`
      ALTER TABLE "audit_log" DROP CONSTRAINT "_uql_audit_log__action_8831f7";
      ALTER TABLE "audit_log" DROP CONSTRAINT "_uql_audit_log__target_kind_3d08d9";
      ALTER TABLE "audit_log" ADD CONSTRAINT "_uql_audit_log__action_62516d"
        CHECK ("action" IN ('role.created', 'role.updated', 'role.deleted', 'member.role_changed', 'override.granted', 'override.revoked', 'override.removed', 'server.drained', 'server.reopened', 'masterpiece.approved', 'masterpiece.rejected', 'player.banned', 'player.muted', 'player.kicked', 'player.invisible', 'sanction.lifted', 'report.resolved'));
      ALTER TABLE "audit_log" ADD CONSTRAINT "_uql_audit_log__target_kind_56515e"
        CHECK ("target_kind" IN ('account', 'role', 'server', 'masterpiece', 'player', 'report'));
    `)
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.raw(`
      DELETE FROM "audit_log" WHERE "target_kind" IN ('player', 'report');
      ALTER TABLE "audit_log" DROP CONSTRAINT "_uql_audit_log__action_62516d";
      ALTER TABLE "audit_log" DROP CONSTRAINT "_uql_audit_log__target_kind_56515e";
      ALTER TABLE "audit_log" ADD CONSTRAINT "_uql_audit_log__action_8831f7"
        CHECK ("action" IN ('role.created', 'role.updated', 'role.deleted', 'member.role_changed', 'override.granted', 'override.revoked', 'override.removed', 'server.drained', 'server.reopened', 'masterpiece.approved', 'masterpiece.rejected'));
      ALTER TABLE "audit_log" ADD CONSTRAINT "_uql_audit_log__target_kind_3d08d9"
        CHECK ("target_kind" IN ('account', 'role', 'server', 'masterpiece'));
    `)
    await schema.dropTable('sanctions')
    await schema.dropTable('reports')
  },
})
