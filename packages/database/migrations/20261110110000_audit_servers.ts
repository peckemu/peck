import { defineBuilderMigration } from 'uql-orm/migrate'

/**
 * The access actions
 */
const ACTIONS = [
  'role.created',
  'role.updated',
  'role.deleted',
  'member.role_changed',
  'override.granted',
  'override.revoked',
  'override.removed',
]

/**
 * The server actions
 */
const SERVER_ACTIONS = ['server.drained', 'server.reopened']

/**
 * Lists values for a check
 * @param values The values
 * @returns The SQL list
 */
const list = (values: readonly string[]): string =>
  values.map((value) => `'${value}'`).join(', ')

/**
 * Lets the audit log record server drains
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.raw(`
      ALTER TABLE "audit_log" DROP CONSTRAINT "_uql_audit_log__action_cf6155";
      ALTER TABLE "audit_log" DROP CONSTRAINT "_uql_audit_log__target_kind_19b240";
      ALTER TABLE "audit_log" ADD CONSTRAINT "_uql_audit_log__action_1a08ee"
        CHECK ("action" IN (${list([...ACTIONS, ...SERVER_ACTIONS])}));
      ALTER TABLE "audit_log" ADD CONSTRAINT "_uql_audit_log__target_kind_633cc9"
        CHECK ("target_kind" IN ('account', 'role', 'server'));
    `)
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.raw(`
      DELETE FROM "audit_log" WHERE "target_kind" = 'server';
      ALTER TABLE "audit_log" DROP CONSTRAINT "_uql_audit_log__action_1a08ee";
      ALTER TABLE "audit_log" DROP CONSTRAINT "_uql_audit_log__target_kind_633cc9";
      ALTER TABLE "audit_log" ADD CONSTRAINT "_uql_audit_log__action_cf6155"
        CHECK ("action" IN (${list(ACTIONS)}));
      ALTER TABLE "audit_log" ADD CONSTRAINT "_uql_audit_log__target_kind_19b240"
        CHECK ("target_kind" IN ('account', 'role'));
    `)
  },
})
