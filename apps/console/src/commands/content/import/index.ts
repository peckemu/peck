import { join } from 'node:path'

import { ContentExporter, ContentNetwork, EXPORTS } from '@peck/content'

import { Command, type Options } from '@peck/plugins'
import { saveEnv } from '#console/env'

/**
 * The root of the repository
 */
const ROOT = join(import.meta.dir, '../../../../../..')

/**
 * Imports the content
 * @class
 */
export class ContentImportCommand extends Command {
  /**
   * The command name
   */
  public readonly name = 'content:import'

  /**
   * The command description
   */
  public readonly description = "Imports the game's content for the seeds"

  /**
   * The command options
   */
  public override readonly options = {
    flashvars: { description: 'Flashvars URL', env: 'CONTENT_FLASHVARS_URL' },
    content: { description: 'Content URL', env: 'CONTENT_URL' },
    key: { description: 'Hash key', env: 'CONTENT_HASH_PREFIX' },
    out: {
      description: 'Where the files are written',
      fallback: join(ROOT, 'packages/database/content'),
    },
    save: { description: 'Saves the URLs and key to .env.local', flag: true },
  }

  /**
   * Imports the content
   * @param options The options
   */
  public async run(options: Options): Promise<void> {
    const flashvars = String(options['flashvars'])
    const root = String(options['content'])
    const prefix = String(options['key'])

    const network = await ContentNetwork.current({ flashvars, root, prefix })
    const written = await new ContentExporter(network, EXPORTS).run(
      String(options['out']),
    )

    console.log(`Imported deploy ${network.deploy}`)
    for (const { file, rows } of written) {
      console.log(`  ${file} ${String(rows)}`)
    }

    if (options['save'] === true) {
      await saveEnv(join(ROOT, '.env.local'), {
        CONTENT_FLASHVARS_URL: flashvars,
        CONTENT_URL: root,
        CONTENT_HASH_PREFIX: prefix,
      })
      console.log('Saved to .env.local')
    }
  }
}
