import {
  createDatabase,
  GenericListDefinition,
  ShopRepository,
} from '@peck/database'
import { Command, type Options } from '@peck/plugins'

/**
 * Puts things in a shop
 * @class
 */
export class ShopStockCommand extends Command {
  /**
   * The command name
   */
  public readonly name = 'shop:stock'

  /**
   * The command description
   */
  public readonly description = 'Puts things in a shop'

  /**
   * The command options
   */
  public override readonly options = {
    database: { description: 'Database URL', env: 'DATABASE_URL' },
    list: { description: "The shop's list id" },
    items: { description: 'The definition ids, comma separated' },
    type: { description: 'What kind of things they are', optional: true },
  }

  /**
   * Puts things in a shop
   * @param options The options
   */
  public async run(options: Options): Promise<void> {
    const listId = Number(options['list'])
    const defIds = String(options['items'])
      .split(',')
      .map(Number)
      .filter(Number.isSafeInteger)

    const database = createDatabase(String(options['database']))
    try {
      const list = await database.findOneById(GenericListDefinition, listId)
      if (!list) throw new Error('No such list')

      const listType =
        typeof options['type'] === 'string'
          ? Number(options['type'])
          : list.type
      const added = await new ShopRepository(database).addStock(
        listId,
        listType,
        defIds,
      )

      console.log(`Stocked ${String(added)} in list ${String(listId)}`)
    } finally {
      await database.end()
    }
  }
}
