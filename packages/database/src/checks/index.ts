import { type MigrationBuilder } from 'uql-orm/migrate'

/**
 * Adds check constraints to a table
 * @param schema The schema builder
 * @param table The table to add them to
 * @param checks The check SQL by name
 */
export const addChecks = async (
  schema: MigrationBuilder,
  table: string,
  checks: Readonly<Record<string, string>>,
): Promise<void> => {
  for (const [name, rule] of Object.entries(checks)) {
    await schema.raw(
      `ALTER TABLE "${table}" ADD CONSTRAINT "${name}" CHECK (${rule})`,
    )
  }
}
