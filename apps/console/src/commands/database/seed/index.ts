import { createDatabase, Seeder, SEEDS } from '@peck/database'
import { Command, type Options, type PluginHost } from '@peck/plugins'

/**
 * Runs the seeds
 * @class
 */
export class SeedCommand extends Command {
  /**
   * The command name
   */
  public readonly name = 'database:seed'

  /**
   * The command description
   */
  public readonly description = "Runs peck's and every plugin's seeds"

  /**
   * The command options
   */
  public override readonly options = {
    database: { description: 'Database URL', env: 'DATABASE_URL' },
    only: { description: 'The seeds to run, comma separated', optional: true },
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
   * Runs the seeds
   * @param options The options
   */
  public async run(options: Options): Promise<void> {
    const only =
      typeof options['only'] === 'string' ? options['only'].split(',') : []
    const production = Bun.env.NODE_ENV === 'production'

    const database = createDatabase(String(options['database']))
    try {
      const seeder = new Seeder(database, [...SEEDS, ...this.plugins.seeds])
      const names = await seeder.run(
        only.map((name) => name.trim()),
        production,
      )
      console.log(`Seeded ${names.join(', ')}`)
    } finally {
      await database.end()
    }
  }
}
