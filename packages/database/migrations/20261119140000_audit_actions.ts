import { defineBuilderMigration } from 'uql-orm/migrate'

/**
 * The audited actions before
 */
const ACTIONS = [
  'role.created',
  'role.updated',
  'role.deleted',
  'member.role_changed',
  'override.granted',
  'override.revoked',
  'override.removed',
  'server.drained',
  'server.reopened',
  'masterpiece.approved',
  'masterpiece.rejected',
  'player.banned',
  'player.muted',
  'player.kicked',
  'player.invisible',
  'sanction.lifted',
  'report.resolved',
]

/**
 * The staff world actions
 */
const STAFF_ACTIONS = ['server.broadcast', 'party.ended', 'jamagram.redacted']

/**
 * Lists values for a check
 * @param values The values
 * @returns The SQL list
 */
const list = (values: readonly string[]): string =>
  values.map((value) => `'${value}'`).join(', ')

/**
 * Lets the audit log record broadcasts, ended parties and redactions
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.raw(`
      ALTER TABLE "audit_log" DROP CONSTRAINT "_uql_audit_log__action_62516d";
      ALTER TABLE "audit_log" ADD CONSTRAINT "_uql_audit_log__action_e37d7d"
        CHECK ("action" IN (${list([...ACTIONS, ...STAFF_ACTIONS])}));
    `)
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.raw(`
      DELETE FROM "audit_log" WHERE "action" IN (${list(STAFF_ACTIONS)});
      ALTER TABLE "audit_log" DROP CONSTRAINT "_uql_audit_log__action_e37d7d";
      ALTER TABLE "audit_log" ADD CONSTRAINT "_uql_audit_log__action_62516d"
        CHECK ("action" IN (${list(ACTIONS)}));
    `)
  },
})
