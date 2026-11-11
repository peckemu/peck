import { ShopListType } from '@peck/shared'

/**
 * A shop's stock by list type
 */
export type Shelf = ReadonlyMap<number, readonly number[]>

/**
 * The shop stock
 * @class
 */
export class ShopStock {
  /**
   * The shelves by shop id
   */
  private readonly shelves = new Map<number, Map<number, number[]>>()

  /**
   * Puts something on a shop's shelf
   * @param shopId The shop's list id
   * @param listType Its kind
   * @param id Its definition id
   */
  public add(shopId: number, listType: number, id: number): void {
    const shelf = this.shelves.get(shopId) ?? new Map<number, number[]>()
    const ids = shelf.get(listType) ?? []

    if (!ids.includes(id)) ids.push(id)

    shelf.set(listType, ids)
    this.shelves.set(shopId, shelf)
  }

  /**
   * Finds what a shop sells
   * @param shopId The shop's list id
   * @returns The shelf, or null
   */
  public shelf(shopId: number): Shelf | null {
    return this.shelves.get(shopId) ?? null
  }

  /**
   * Checks a shop sells something
   * @param shopId The shop's list id
   * @param listType Its kind
   * @param id Its definition id
   * @param diamondDefId The diamond shop entry, or 0
   * @returns Whether it is sold
   */
  public sells(
    shopId: number,
    listType: number,
    id: number,
    diamondDefId: number,
  ): boolean {
    const shelf = this.shelves.get(shopId)
    if (!shelf) return false

    if (shelf.get(listType)?.includes(id)) return true

    return (
      diamondDefId !== 0 &&
      (shelf.get(ShopListType.DiamondShop)?.includes(diamondDefId) ?? false)
    )
  }
}
