import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the masterpieces table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('masterpieces', (table) => {
      table.text('unique_image_id').primaryKey()
      table
        .integer('creator_game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.text('status').notNullable().defaultValue('uploaded')
      table.text('image_type').notNullable()
      table.integer('diamonds_paid').notNullable().defaultValue(0)
      table.boolean('token_paid').notNullable().defaultValue(false)
      table
        .timestamptz('created_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.timestamptz('decided_at').nullable()
    })

    await schema.createIndex(
      'masterpieces',
      ['creator_game_id', 'created_at'],
      {
        name: 'masterpieces_creator',
      },
    )
    await schema.createIndex('masterpieces', ['status', 'created_at'], {
      name: 'masterpieces_status',
    })

    await addChecks(schema, 'masterpieces', {
      _uql_masterpieces__status_f96c00: `"status" IN ('uploaded', 'discarded', 'pending', 'approved', 'rejected')`,
    })

    await schema.raw(
      'ALTER TABLE "transactions" DROP CONSTRAINT "_uql_transactions__kind_76437e"',
    )
    await addChecks(schema, 'transactions', {
      _uql_transactions__kind_c2e5ed: `"kind" IN ('eco-credits', 'eco-gift', 'photo-booth', 'buy', 'bundle', 'exchange', 'donation', 'recycle', 'den-shop-purchase', 'den-shop-sale', 'party-host', 'pet-salon', 'masterpiece-refund')`,
    })

    await schema.raw(`
      ALTER TABLE "audit_log" DROP CONSTRAINT "_uql_audit_log__action_1a08ee";
      ALTER TABLE "audit_log" DROP CONSTRAINT "_uql_audit_log__target_kind_633cc9";
      ALTER TABLE "audit_log" ADD CONSTRAINT "_uql_audit_log__action_8831f7"
        CHECK ("action" IN ('role.created', 'role.updated', 'role.deleted', 'member.role_changed', 'override.granted', 'override.revoked', 'override.removed', 'server.drained', 'server.reopened', 'masterpiece.approved', 'masterpiece.rejected'));
      ALTER TABLE "audit_log" ADD CONSTRAINT "_uql_audit_log__target_kind_3d08d9"
        CHECK ("target_kind" IN ('account', 'role', 'server', 'masterpiece'));
    `)

    await schema.addColumn('den_items', (columns) =>
      columns.text('unique_image_id').notNullable().defaultValue(''),
    )
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.raw(`
      DELETE FROM "audit_log" WHERE "target_kind" = 'masterpiece';
      ALTER TABLE "audit_log" DROP CONSTRAINT "_uql_audit_log__action_8831f7";
      ALTER TABLE "audit_log" DROP CONSTRAINT "_uql_audit_log__target_kind_3d08d9";
      ALTER TABLE "audit_log" ADD CONSTRAINT "_uql_audit_log__action_1a08ee"
        CHECK ("action" IN ('role.created', 'role.updated', 'role.deleted', 'member.role_changed', 'override.granted', 'override.revoked', 'override.removed', 'server.drained', 'server.reopened'));
      ALTER TABLE "audit_log" ADD CONSTRAINT "_uql_audit_log__target_kind_633cc9"
        CHECK ("target_kind" IN ('account', 'role', 'server'));
    `)
    await schema.raw(
      `DELETE FROM "transactions" WHERE "kind" = 'masterpiece-refund'`,
    )
    await schema.raw(
      'ALTER TABLE "transactions" DROP CONSTRAINT "_uql_transactions__kind_c2e5ed"',
    )
    await addChecks(schema, 'transactions', {
      _uql_transactions__kind_76437e: `"kind" IN ('eco-credits', 'eco-gift', 'photo-booth', 'buy', 'bundle', 'exchange', 'donation', 'recycle', 'den-shop-purchase', 'den-shop-sale', 'party-host', 'pet-salon')`,
    })
    await schema.alterTable('den_items', (table) =>
      table.dropColumn('unique_image_id'),
    )
    await schema.dropTable('masterpieces')
  },
})
