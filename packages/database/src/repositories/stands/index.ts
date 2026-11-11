import { CURRENCIES } from '@peck/shared'

import { DenItem } from '#database/entities/den/item'
import { DenShopListing } from '#database/entities/den/listing'
import { DenShop } from '#database/entities/den/shop'
import { Item } from '#database/entities/item'
import { Player } from '#database/entities/player'
import { TransactionCurrency } from '#database/entities/transactions/currency'
import { TransactionItem } from '#database/entities/transactions/item'
import { Transaction } from '#database/entities/transactions/transaction'
import { type Database, type Querier } from '#database/pool'

/**
 * What can go on a stand
 */
export const DenShopItemKind = {
  /**
   * A den item
   */
  DenItem: 0,

  /**
   * A pet
   */
  Pet: 1,

  /**
   * Clothing
   */
  Clothing: 2,
} as const

export type DenShopItemKind =
  (typeof DenShopItemKind)[keyof typeof DenShopItemKind]

/**
 * The most listings one stand holds
 */
const MOST_LISTINGS = 24

/**
 * The listing price limits
 */
const PRICES = new Map<number, readonly [number, number]>([
  [0, [50, 15_000]],
  [3, [1, 500]],
])

/**
 * Something listed on a stand
 */
export type StandListing = {
  /**
   * Its kind
   */
  readonly itemKind: number

  /**
   * Its place in the owner's inventory
   */
  readonly invIdx: number

  /**
   * Gems 0 or diamonds 3
   */
  readonly currency: number

  /**
   * What it costs
   */
  readonly cost: number

  /**
   * Its definition id
   */
  readonly defId: number

  /**
   * Its colour
   */
  readonly color: number

  /**
   * Which of its looks
   */
  readonly version: number
}

/**
 * A stand
 */
export type Stand = {
  /**
   * How many times it has changed
   */
  readonly state: number

  /**
   * What is listed
   */
  readonly listings: readonly StandListing[]
}

/**
 * A change to a listing
 */
export type ListingChange = {
  /**
   * Its kind
   */
  readonly itemKind: number

  /**
   * Its place in the owner's inventory
   */
  readonly invIdx: number

  /**
   * Gems 0 or diamonds 3
   */
  readonly currency: number

  /**
   * What it costs
   */
  readonly cost: number
}

/**
 * Why a stand change was refused
 */
export type StandRefusal = 'state' | 'item' | 'price' | 'full'

/**
 * A stand purchase
 */
export type StandPurchase = {
  /**
   * The player buying
   */
  readonly buyerGameId: number

  /**
   * The player selling
   */
  readonly sellerGameId: number

  /**
   * The stand
   */
  readonly storeInvIdx: number

  /**
   * The stand's state the buyer saw
   */
  readonly seen: number

  /**
   * Its kind
   */
  readonly itemKind: number

  /**
   * Its place in the seller's inventory
   */
  readonly invIdx: number

  /**
   * The currency the buyer saw
   */
  readonly currency: number

  /**
   * The cost the buyer saw
   */
  readonly cost: number
}

/**
 * What a stand purchase came to
 */
export type StandSale = {
  /**
   * The stand's state afterwards
   */
  readonly state: number

  /**
   * Where it went in the buyer's inventory
   */
  readonly buyerInvIdx: number

  /**
   * Its definition id
   */
  readonly defId: number

  /**
   * Its colour
   */
  readonly color: number

  /**
   * Which of its looks
   */
  readonly version: number

  /**
   * The buyer's balance afterwards
   */
  readonly buyerBalance: number

  /**
   * The seller's balance afterwards
   */
  readonly sellerBalance: number
}

/**
 * Why a stand purchase was refused
 */
export type SaleRefusal = 'self' | 'state' | 'listing' | 'funds'

/**
 * A transaction refusal
 * @class
 */
class Refused<R extends string> extends Error {
  /**
   * Why
   */
  public readonly refusal: R

  /**
   * Creates the refusal
   * @param refusal Why
   */
  public constructor(refusal: R) {
    super(refusal)
    this.refusal = refusal
  }
}

/**
 * Reads and changes den shop stands
 * @class
 */
export class DenShopRepository {
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
   * Reads a stand
   * @param gameId The owner
   * @param storeInvIdx The stand
   * @returns The stand, or null
   */
  public async stand(
    gameId: number,
    storeInvIdx: number,
  ): Promise<Stand | null> {
    const stand = await this.database.findOne(DenItem, {
      $where: { gameId, invIdx: storeInvIdx },
    })
    if (!stand) return null

    const [shop, listings] = await Promise.all([
      this.database.findOne(DenShop, { $where: { gameId, storeInvIdx } }),
      this.database.findMany(DenShopListing, {
        $where: { gameId, storeInvIdx },
        $sort: { listedAt: 'asc', itemInvIdx: 'asc' },
      }),
    ])

    const shown: StandListing[] = []
    for (const listing of listings) {
      const item = await DenShopRepository.item(
        this.database,
        gameId,
        listing.itemKind,
        listing.itemInvIdx,
      )
      if (item) {
        shown.push({
          ...item,
          itemKind: listing.itemKind,
          invIdx: listing.itemInvIdx,
          currency: listing.currency,
          cost: listing.cost,
        })
      }
    }

    return { state: shop?.state ?? 0, listings: shown }
  }

  /**
   * Changes a stand's stock
   * @param gameId The owner
   * @param storeInvIdx The stand
   * @param seen The state the owner saw
   * @param upserts Listings added or changed
   * @param removals Listings taken off
   * @returns The new state, or the refusal
   */
  public async update(
    gameId: number,
    storeInvIdx: number,
    seen: number,
    upserts: readonly ListingChange[],
    removals: readonly Pick<ListingChange, 'itemKind' | 'invIdx'>[],
  ): Promise<{ readonly state: number } | { readonly refusal: StandRefusal }> {
    try {
      return await this.database.transaction(async (querier) => {
        const state = await DenShopRepository.state(
          querier,
          gameId,
          storeInvIdx,
        )
        if (state !== seen) throw new Refused<StandRefusal>('state')

        for (const removal of removals) {
          await DenShopRepository.unlist(querier, gameId, storeInvIdx, removal)
        }

        for (const upsert of upserts) {
          await DenShopRepository.list(querier, gameId, storeInvIdx, upsert)
        }

        const count = await querier.count(DenShopListing, {
          $where: { gameId, storeInvIdx },
        })
        if (count > MOST_LISTINGS) throw new Refused<StandRefusal>('full')

        return {
          state: await DenShopRepository.bump(
            querier,
            gameId,
            storeInvIdx,
            state,
          ),
        }
      })
    } catch (error) {
      if (error instanceof Refused) {
        return { refusal: error.refusal as StandRefusal }
      }
      throw error
    }
  }

  /**
   * Buys from a stand
   * @param purchase The purchase
   * @returns The total, or the refusal
   */
  public async buy(
    purchase: StandPurchase,
  ): Promise<StandSale | { readonly refusal: SaleRefusal }> {
    if (purchase.buyerGameId === purchase.sellerGameId) {
      return { refusal: 'self' }
    }

    try {
      return await this.database.transaction(async (querier) => {
        const { sellerGameId, buyerGameId, storeInvIdx, itemKind, invIdx } =
          purchase

        const state = await DenShopRepository.state(
          querier,
          sellerGameId,
          storeInvIdx,
        )
        if (state !== purchase.seen) throw new Refused<SaleRefusal>('state')

        const listing = await querier.findOne(DenShopListing, {
          $where: {
            gameId: sellerGameId,
            itemKind,
            itemInvIdx: invIdx,
            storeInvIdx,
          },
        })
        if (
          listing?.currency !== purchase.currency ||
          listing.cost !== purchase.cost
        ) {
          throw new Refused<SaleRefusal>('listing')
        }

        const currency = CURRENCIES[listing.currency]
        if (!currency) throw new Refused<SaleRefusal>('listing')

        const paid = await querier.updateMany(
          Player,
          {
            $where: {
              gameId: buyerGameId,
              [currency]: { $gte: listing.cost },
            },
          },
          { [currency]: { $inc: -listing.cost } },
        )
        if (paid === 0) throw new Refused<SaleRefusal>('funds')

        const item = await DenShopRepository.item(
          querier,
          sellerGameId,
          itemKind,
          invIdx,
        )
        if (!item) throw new Refused<SaleRefusal>('listing')

        await DenShopRepository.remove(querier, sellerGameId, itemKind, invIdx)
        const buyerInvIdx = await DenShopRepository.add(
          querier,
          buyerGameId,
          itemKind,
          item,
        )

        await querier.deleteMany(DenShopListing, {
          $where: { gameId: sellerGameId, itemKind, itemInvIdx: invIdx },
        })
        const newState = await DenShopRepository.bump(
          querier,
          sellerGameId,
          storeInvIdx,
          state,
        )

        await querier.updateOneById(Player, sellerGameId, {
          [currency]: { $inc: listing.cost },
        })

        const [buyer, seller] = await Promise.all([
          querier.findOneById(Player, buyerGameId),
          querier.findOneById(Player, sellerGameId),
        ])
        const buyerBalance = buyer?.[currency] ?? 0
        const sellerBalance = seller?.[currency] ?? 0

        const kind: 'clothing' | 'den-item' =
          itemKind === DenShopItemKind.Clothing ? 'clothing' : 'den-item'
        const sale = {
          kind,
          currency: listing.currency,
          defId: item.defId,
          color: item.color,
          version: item.version,
        }

        await DenShopRepository.record(
          querier,
          buyerGameId,
          sellerGameId,
          'den-shop-purchase',
          {
            ...sale,
            invIdx: buyerInvIdx,
            change: -listing.cost,
            balance: buyerBalance,
          },
        )
        await DenShopRepository.record(
          querier,
          sellerGameId,
          buyerGameId,
          'den-shop-sale',
          {
            ...sale,
            invIdx,
            change: listing.cost,
            balance: sellerBalance,
          },
        )

        return {
          state: newState,
          buyerInvIdx,
          defId: item.defId,
          color: item.color,
          version: item.version,
          buyerBalance,
          sellerBalance,
        }
      })
    } catch (error) {
      if (error instanceof Refused) {
        return { refusal: error.refusal as SaleRefusal }
      }
      throw error
    }
  }

  /**
   * Reads a stand's state
   * @param querier The querier
   * @param gameId The owner
   * @param storeInvIdx The stand
   * @returns The state
   */
  private static async state(
    querier: Querier,
    gameId: number,
    storeInvIdx: number,
  ): Promise<number> {
    return (
      (await querier.findOne(DenShop, { $where: { gameId, storeInvIdx } }))
        ?.state ?? 0
    )
  }

  /**
   * Moves a stand's state on by one
   * @param querier The querier
   * @param gameId The owner
   * @param storeInvIdx The stand
   * @param state The state now
   * @returns The new state
   */
  private static async bump(
    querier: Querier,
    gameId: number,
    storeInvIdx: number,
    state: number,
  ): Promise<number> {
    const next = state + 1
    await querier.upsertOne(
      DenShop,
      { gameId: true, storeInvIdx: true },
      { gameId, storeInvIdx, state: next },
    )

    return next
  }

  /**
   * Lists something on a stand
   * @param querier The querier
   * @param gameId The owner
   * @param storeInvIdx The stand
   * @param change The listing
   */
  private static async list(
    querier: Querier,
    gameId: number,
    storeInvIdx: number,
    change: ListingChange,
  ): Promise<void> {
    const range = PRICES.get(change.currency)
    if (!range || change.cost < range[0] || change.cost > range[1]) {
      throw new Refused<StandRefusal>('price')
    }

    const owned = await DenShopRepository.item(
      querier,
      gameId,
      change.itemKind,
      change.invIdx,
    )
    const isStand =
      change.itemKind === DenShopItemKind.DenItem &&
      change.invIdx === storeInvIdx
    if (!owned || isStand) throw new Refused<StandRefusal>('item')

    await querier.upsertOne(
      DenShopListing,
      { gameId: true, itemKind: true, itemInvIdx: true },
      {
        gameId,
        itemKind: change.itemKind,
        itemInvIdx: change.invIdx,
        storeInvIdx,
        currency: change.currency,
        cost: change.cost,
      },
    )
    await DenShopRepository.mark(
      querier,
      gameId,
      change.itemKind,
      change.invIdx,
      storeInvIdx,
    )
  }

  /**
   * Takes something off a stand
   * @param querier The querier
   * @param gameId The owner
   * @param storeInvIdx The stand
   * @param removal The listing
   */
  private static async unlist(
    querier: Querier,
    gameId: number,
    storeInvIdx: number,
    removal: Pick<ListingChange, 'itemKind' | 'invIdx'>,
  ): Promise<void> {
    const taken = await querier.deleteMany(DenShopListing, {
      $where: {
        gameId,
        itemKind: removal.itemKind,
        itemInvIdx: removal.invIdx,
        storeInvIdx,
      },
    })
    if (taken > 0) {
      await DenShopRepository.mark(
        querier,
        gameId,
        removal.itemKind,
        removal.invIdx,
        0,
      )
    }
  }

  /**
   * Sets which stand an item is on
   * @param querier The querier
   * @param gameId The owner
   * @param itemKind Its kind
   * @param invIdx Its place in the inventory
   * @param storeInvIdx The stand, or 0
   */
  private static async mark(
    querier: Querier,
    gameId: number,
    itemKind: number,
    invIdx: number,
    storeInvIdx: number,
  ): Promise<void> {
    if (itemKind === DenShopItemKind.Clothing) {
      await querier.updateMany(
        Item,
        { $where: { gameId, invId: invIdx } },
        { denStoreInvIdx: storeInvIdx },
      )
    } else {
      await querier.updateMany(
        DenItem,
        { $where: { gameId, invIdx } },
        { denStoreInvIdx: storeInvIdx },
      )
    }
  }

  /**
   * Reads a stand item
   * @param querier The querier
   * @param gameId The owner
   * @param itemKind Its kind
   * @param invIdx Its place in the inventory
   * @returns The item, or null
   */
  private static async item(
    querier: Querier | Database,
    gameId: number,
    itemKind: number,
    invIdx: number,
  ): Promise<{
    readonly defId: number
    readonly color: number
    readonly version: number
    readonly uniqueImageId?: string
  } | null> {
    if (itemKind === DenShopItemKind.Clothing) {
      const item = await querier.findOne(Item, {
        $where: { gameId, invId: invIdx },
      })

      return item ? { defId: item.defId, color: item.color, version: 0 } : null
    }

    if (itemKind !== DenShopItemKind.DenItem) return null

    const item = await querier.findOne(DenItem, { $where: { gameId, invIdx } })

    return item
      ? {
          defId: item.defId,
          color: 0,
          version: item.version,
          ...(item.uniqueImageId ? { uniqueImageId: item.uniqueImageId } : {}),
        }
      : null
  }

  /**
   * Takes a sold item from the seller
   * @param querier The querier
   * @param gameId The seller
   * @param itemKind Its kind
   * @param invIdx Its place in the inventory
   */
  private static async remove(
    querier: Querier,
    gameId: number,
    itemKind: number,
    invIdx: number,
  ): Promise<void> {
    if (itemKind === DenShopItemKind.Clothing) {
      await querier.deleteMany(Item, { $where: { gameId, invId: invIdx } })
    } else {
      await querier.deleteMany(DenItem, { $where: { gameId, invIdx } })
    }
  }

  /**
   * Gives a bought item to the buyer
   * @param querier The querier
   * @param gameId The buyer
   * @param itemKind Its kind
   * @param item The item
   * @returns Its place in the buyer's inventory
   */
  private static async add(
    querier: Querier,
    gameId: number,
    itemKind: number,
    item: {
      readonly defId: number
      readonly color: number
      readonly version: number
      readonly uniqueImageId?: string
    },
  ): Promise<number> {
    if (itemKind === DenShopItemKind.Clothing) {
      const [last] = await querier.findMany(Item, {
        $select: { invId: true },
        $where: { gameId },
        $sort: { invId: 'desc' },
        $limit: 1,
      })
      const invId = (last?.invId ?? 0) + 1
      await querier.insertOne(Item, {
        gameId,
        invId,
        defId: item.defId,
        color: item.color,
      })

      return invId
    }

    const [last] = await querier.findMany(DenItem, {
      $select: { invIdx: true },
      $where: { gameId },
      $sort: { invIdx: 'desc' },
      $limit: 1,
    })
    const invIdx = (last?.invIdx ?? 0) + 1
    await querier.insertOne(DenItem, {
      gameId,
      invIdx,
      defId: item.defId,
      version: item.version,
      uniqueImageId: item.uniqueImageId ?? '',
    })

    return invIdx
  }

  /**
   * Records one side of a stand sale
   * @param querier The querier
   * @param gameId The player
   * @param counterpartGameId The other player
   * @param kind Purchase or sale
   * @param sale What moved
   */
  private static async record(
    querier: Querier,
    gameId: number,
    counterpartGameId: number,
    kind: 'den-shop-purchase' | 'den-shop-sale',
    sale: {
      readonly kind: 'clothing' | 'den-item'
      readonly currency: number
      readonly defId: number
      readonly color: number
      readonly version: number
      readonly invIdx: number
      readonly change: number
      readonly balance: number
    },
  ): Promise<void> {
    const [row] = await querier.insertMany(
      Transaction,
      [{ gameId, kind, counterpartGameId }],
      {
        returning: { id: true },
      },
    )
    const transactionId = row?.id ?? 0

    await querier.insertOne(TransactionCurrency, {
      transactionId,
      currency: sale.currency,
      change: sale.change,
      balance: sale.balance,
    })
    await querier.insertOne(TransactionItem, {
      transactionId,
      seq: 0,
      itemKind: sale.kind,
      invIdx: sale.invIdx,
      defId: sale.defId,
      color: sale.color,
      version: sale.version,
    })
  }
}
