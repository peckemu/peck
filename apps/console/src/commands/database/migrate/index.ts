import { createDatabase } from '@peck/database'
import { Command, type Options, type PluginHost } from '@peck/plugins'

import { migrationSets } from '#console/migrations'

/**
 * Runs the migrations
 * @class
 */
export class MigrateCommand extends Command {
  /**
   * The command name
   */
  public readonly name = 'database:migrate'

  /**
   * The command description
   */
  public readonly description = "Runs peck's and every plugin's migrations"

  /**
   * The command options
   */
  public override readonly options = {
    database: { description: 'Database URL', env: 'DATABASE_URL' },
  }

  /**
   * The plugins
   */
  private readonly plugins: PluginHost

  /**
   * Creates the command
   * @param plugins The plugins
   */
  public constructor(plugins: PluginHost) {
    super()
    this.plugins = plugins
  }

  /**
   * Runs the migrations
   * @param options The options
   */
  public async run(options: Options): Promise<void> {
    const database = createDatabase(String(options['database']), 1)
    try {
      for (const { name, migrator } of migrationSets(database, this.plugins)) {
        const applied = await migrator.up()
        console.log(`${name}: ${String(applied.length)} applied`)
      }
    } finally {
      await database.end()
    }
  }
}
