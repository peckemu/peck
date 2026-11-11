import { join } from 'node:path'

import { Command, type Options, type PluginHost } from '@peck/plugins'

import { MigrateCommand } from '#console/commands/database/migrate'

/**
 * @sxip This command requires git to be installed and available in the PATH, if you do not have git installed, the update will fail..
 * I should probably add a check to ensure git is installed before attempting the update but for now it assumes git is available :)
 */

/**
 * The project folder
 */
const ROOT = join(import.meta.dir, '../../../../..')

/**
 * Updates peck from its repository
 * @class
 */
export class UpdateCommand extends Command {
  /**
   * The command name
   */
  public readonly name = 'update'

  /**
   * The command description
   */
  public readonly description = 'Updates peck to the latest version'

  /**
   * The command options
   */
  public override readonly options = {
    repository: {
      description: 'Repository URL',
      fallback: 'https://github.com/peckemu/peck',
    },
    branch: { description: 'Branch', fallback: 'main' },
    database: {
      description: 'Database URL',
      env: 'DATABASE_URL',
      optional: true,
    },
    check: { description: 'Only lists what is new', flag: true },
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
   * Updates peck
   * @param options The options
   */
  public async run(options: Options): Promise<void> {
    const repository = String(options['repository'])
    const branch = String(options['branch'])

    await this.git('fetch', '--quiet', repository, branch)

    const commits = await this.git('log', '--format=%h %s', 'HEAD..FETCH_HEAD')
    if (commits === '') {
      console.log('Already up to date')
      return
    }

    console.log(`New commits:\n${commits}`)
    if (options['check'] === true) return

    const refusal = await this.refusal()
    if (refusal) throw new Error(refusal)

    await this.git('merge', '--ff-only', '--quiet', 'FETCH_HEAD')
    console.log('Code updated')

    await Bun.$`bun install`.cwd(ROOT).quiet()
    console.log('Dependencies installed')

    if (typeof options['database'] !== 'string') {
      console.log('No database set, run database:migrate later')
      return
    }

    await new MigrateCommand(this.plugins).run({
      /**
       * The database URL
       */
      database: options['database'],
    })
  }

  /**
   * Checks the update can go ahead
   * @returns The reason, or null
   */
  private async refusal(): Promise<string | null> {
    if ((await this.git('status', '--porcelain')) !== '') {
      return 'Commit or stash your changes first'
    }

    const { exitCode } =
      await Bun.$`git merge-base --is-ancestor HEAD FETCH_HEAD`
        .cwd(ROOT)
        .nothrow()
        .quiet()
    if (exitCode !== 0) return 'Local history differs, update by hand'

    return null
  }

  /**
   * Runs git in the project folder
   * @param args The git arguments
   * @returns The output
   */
  private async git(...args: string[]): Promise<string> {
    const output = await Bun.$`git ${args}`.cwd(ROOT).quiet().text()

    return output.trim()
  }
}
