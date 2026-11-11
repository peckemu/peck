import { Item } from '#database/entities/item'
import { type Database } from '#database/pool'

/**
 * Reads and writes the items players own
 * @class
 */
export class ItemRepository {
  /**
   * The database
   */
  private readonly database: Database

  /**
   * Creates the repository
   * @param database The database
   */
  public constructor(database: Database) {
    this.database = database
  }

  /**
   * Lists a player's items
   * @param gameId The player's id
   * @returns The items
   */
  public async of(gameId: number): Promise<Item[]> {
    return this.database.findMany(Item, {
      $where: { gameId },
      $sort: { invId: 'asc' },
    })
  }

  /**
   * Gives a player an item
   * @param gameId The player's id
   * @param defId The item's definition id
   * @param color The item's colour
   * @returns The item
   */
  public async give(gameId: number, defId: number, color = 0): Promise<Item> {
    return this.database.transaction(async (querier) => {
      const [last] = await querier.findMany(Item, {
        $select: { invId: true },
        $where: { gameId },
        $sort: { invId: 'desc' },
        $limit: 1,
      })
      const item = { gameId, invId: (last?.invId ?? 0) + 1, defId, color }
      await querier.insertOne(Item, item)
      return {
        ...item,
        equippedAvatars: '0',
        denStoreInvIdx: 0,
        createdAt: new Date(),
      }
    })
  }

  /**
   * Takes items from a player
   * @param gameId The player's id
   * @param invIds The items' places in the inventory
   * @returns How many were taken
   */
  public async take(
    gameId: number,
    invIds: readonly number[],
  ): Promise<number> {
    if (invIds.length === 0) return 0
    return this.database.deleteMany(Item, {
      $where: { gameId, invId: { $in: [...invIds] } },
    })
  }
}
