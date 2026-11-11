import { createDatabase, ShopRepository } from '@peck/database'
import { Command, type Options } from '@peck/plugins'

/**
 * Takes things out of a shop
 * @class
 */
export class ShopUnstockCommand extends Command {
  /**
   * The command name
   */
  public readonly name = 'shop:unstock'

  /**
   * The command description
   */
  public readonly description = 'Takes things out of a shop'

  /**
   * The command options
   */
  public override readonly options = {
    database: { description: 'Database URL', env: 'DATABASE_URL' },
    list: { description: "The shop's list id" },
    items: {
      description: 'The definition ids, comma separated, or all',
      optional: true,
    },
  }

  /**
   * Takes things out of a shop
   * @param options The options
   */
  public async run(options: Options): Promise<void> {
    const listId = Number(options['list'])
    const defIds =
      typeof options['items'] === 'string'
        ? options['items'].split(',').map(Number).filter(Number.isSafeInteger)
        : undefined

    const database = createDatabase(String(options['database']))
    try {
      const removed = await new ShopRepository(database).removeStock(
        listId,
        defIds,
      )

      console.log(`Took ${String(removed)} out of list ${String(listId)}`)
    } finally {
      await database.end()
    }
  }
}
