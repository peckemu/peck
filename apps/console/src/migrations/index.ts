import { type Database, MIGRATIONS } from '@peck/database'
import { type PluginHost } from '@peck/plugins'
import { Migrator } from 'uql-orm/migrate'

/**
 * The core migration set name
 */
export const CORE = 'peck'

/**
 * A migration set
 */
export type MigrationSet = {
  /**
   * The set name
   */
  readonly name: string

  /**
   * The migrator
   */
  readonly migrator: Migrator
}

/**
 * Lists the migration sets
 * @param database The database
 * @param plugins The plugins
 * @returns The migration sets
 */
export const migrationSets = (
  database: Database,
  plugins: PluginHost,
): MigrationSet[] => {
  const pool = database as unknown as ConstructorParameters<typeof Migrator>[0]
  return [
    {
      name: CORE,
      migrator: new Migrator(pool, { migrationsPath: MIGRATIONS }),
    },
    ...plugins.migrations.map(({ plugin, path }) => ({
      name: plugin,
      migrator: new Migrator(pool, {
        migrationsPath: path,
        tableName: `uql_migrations_${plugin.replace(/\W/g, '_')}`,
      }),
    })),
  ]
}
