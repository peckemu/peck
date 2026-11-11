import { ShopListType } from '@peck/shared'

/**
 * A shelf in a shop list
 */
export type ListShelf = {
  /**
   * Their kind
   */
  readonly listType: number

  /**
   * Their definition ids
   */
  readonly ids: readonly number[]
}

/**
 * The fields before a list's ids
 */
const HEAD = 5

/**
 * The shop list types
 */
const SHOP_TYPES: ReadonlySet<number> = new Set([
  ShopListType.Clothing,
  ShopListType.DenItems,
  ShopListType.DenRooms,
  ShopListType.CurrencyExchange,
  ShopListType.DiamondShop,
])

/**
 * The generic list contents
 * @class
 */
export class GenericListContents {
  /**
   * The lists by id
   */
  private readonly lists = new Map<number, readonly string[]>()

  /**
   * Keeps a list
   * @param listId The list's id
   * @param fields Its other fields
   */
  public add(listId: number, fields: readonly string[]): void {
    this.lists.set(listId, fields)
  }

  /**
   * Finds a list
   * @param listId The list's id
   * @returns Its other fields, or null
   */
  public get(listId: number): readonly string[] | null {
    return this.lists.get(listId) ?? null
  }

  /**
   * Lists every list
   * @returns The lists by id
   */
  public all(): ReadonlyMap<number, readonly string[]> {
    return this.lists
  }

  /**
   * Reads what a shop list sells
   * @param fields The list's other fields
   * @returns The shelves
   */
  public static shelves(fields: readonly string[]): ListShelf[] {
    const listType = Number(fields[0])
    const body = fields.slice(HEAD).map(Number)

    if (listType === ShopListType.Combined) {
      const types = (fields[HEAD + 1] ?? '').split(',').map(Number)
      const counts = (fields[HEAD + 2] ?? '').split(',').map(Number)
      const ids = body.slice(3)

      let at = 0
      return types.flatMap((type, index) => {
        const count = counts[index] ?? 0
        const shelf = ids.slice(at, at + count)
        at += count

        return SHOP_TYPES.has(type) ? [{ listType: type, ids: shelf }] : []
      })
    }

    if (!SHOP_TYPES.has(listType)) return []

    const [count = 0, ...ids] = body

    return [{ listType, ids: ids.slice(0, count) }]
  }
}
