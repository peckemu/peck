import { CURRENCIES, type Currency } from '@peck/shared'

import { Avatar } from '#database/entities/avatar'
import { DenItem } from '#database/entities/den/item'
import { DenShopListing } from '#database/entities/den/listing'
import { DenRoom } from '#database/entities/den/room'
import { DenShop } from '#database/entities/den/shop'
import { Item } from '#database/entities/item'
import { Masterpiece } from '#database/entities/masterpiece'
import { Pet } from '#database/entities/pet'
import { Player } from '#database/entities/player'
import { ShopStock } from '#database/entities/shop/stock'
import { TransactionCurrency } from '#database/entities/transactions/currency'
import {
  TransactionItem,
  type TransactionItemKind,
} from '#database/entities/transactions/item'
import { TradeListing } from '#database/entities/trade/listing'
import {
  Transaction,
  type TransactionKind,
} from '#database/entities/transactions/transaction'
import { type Database, type Querier } from '#database/pool'
import { type AvatarLook } from '#database/repositories/avatars'

/**
 * An amount of one currency
 */
export type Payment = {
  /**
   * The currency
   */
  readonly currency: number

  /**
   * How much
   */
  readonly amount: number
}

/**
 * Something bought from a shop
 */
export type Purchase = {
  /**
   * Its kind
   */
  readonly kind: 'clothing' | 'den-item' | 'den-room'

  /**
   * The shop's list id
   */
  readonly shopId: number

  /**
   * The diamond shop entry, or 0
   */
  readonly diamondDefId: number

  /**
   * What is paid
   */
  readonly costs: readonly Payment[]

  /**
   * Its definition id
   */
  readonly defId: number

  /**
   * Its colour
   */
  readonly color?: number

  /**
   * Which of its looks
   */
  readonly version?: number

  /**
   * The den room slot
   */
  readonly slot?: number

  /**
   * The masterpiece in it
   */
  readonly uniqueImageId?: string
}

/**
 * A masterpiece framed
 */
export type Framed = {
  /**
   * The frame's den item place
   */
  readonly invIdx: number

  /**
   * The balances afterwards
   */
  readonly balances: Partial<Record<Currency, number>>

  /**
   * The token spent, or null
   */
  readonly tokenInvIdx: number | null
}

/**
 * A pet adopted
 */
export type Adoption = {
  /**
   * The shop's list id
   */
  readonly shopId: number

  /**
   * The diamond shop entry, or 0
   */
  readonly diamondDefId: number

  /**
   * What is paid
   */
  readonly costs: readonly Payment[]

  /**
   * Its look
   */
  readonly lBits: number

  /**
   * More traits
   */
  readonly uBits: number

  /**
   * Its name
   */
  readonly name: string

  /**
   * Its personality
   */
  readonly personalityDefId: number

  /**
   * Its favourite toy
   */
  readonly favoriteToyDefId: number

  /**
   * Its favourite food
   */
  readonly favoriteFoodDefId: number

  /**
   * The unlocked pets afterwards
   */
  readonly unlockedPets: string

  /**
   * The most pets the player can have
   */
  readonly limit: number
}

/**
 * What adopting came to
 */
export type Adopted = {
  /**
   * The pet
   */
  readonly pet: Pet

  /**
   * The new balances
   */
  readonly balances: Partial<Record<Currency, number>>
}

/**
 * What a purchase came to
 */
export type Purchased = {
  /**
   * Where it went in the inventory
   */
  readonly invIdx: number

  /**
   * The new balances
   */
  readonly balances: Partial<Record<Currency, number>>
}

/**
 * Something recycled
 */
export type Recycling = {
  /**
   * Its place in the inventory
   */
  readonly invIdx: number

  /**
   * Its definition id
   */
  readonly defId: number

  /**
   * The gems it gives
   */
  readonly gems: number
}

/**
 * What recycling came to
 */
export type Recycled = {
  /**
   * The recycled places
   */
  readonly recycled: readonly number[]

  /**
   * The gems afterwards
   */
  readonly gems: number
}

/**
 * An animal bought
 */
export type AnimalPurchase = {
  /**
   * How it looks
   */
  readonly look: AvatarLook

  /**
   * Its slot
   */
  readonly slot: number

  /**
   * What is paid
   */
  readonly cost: Payment

  /**
   * The diamond shop entry, or 0
   */
  readonly diamondDefId: number

  /**
   * The shop, or 0
   */
  readonly shopId: number

  /**
   * The player's new slot flags
   */
  readonly avatarSlotFlags: number
}

/**
 * What an animal came to
 */
export type BoughtAnimal = {
  /**
   * The animal
   */
  readonly avatar: Avatar

  /**
   * The new balances
   */
  readonly balances: Partial<Record<Currency, number>>
}

/**
 * An animal removed
 */
export type AnimalRecycling = {
  /**
   * The animal
   */
  readonly perUserAvId: number

  /**
   * The refunded gems
   */
  readonly gems: number

  /**
   * The changed items
   */
  readonly items: readonly {
    readonly invId: number
    readonly equippedAvatars: string
  }[]
}

/**
 * A currency exchange
 */
export type CurrencyExchange = {
  /**
   * The shop's list id
   */
  readonly shopId: number

  /**
   * What is paid
   */
  readonly costs: readonly Payment[]

  /**
   * What is given
   */
  readonly gain: Payment
}

/**
 * Something in a bundle
 */
export type BundlePart = {
  /**
   * Its kind
   */
  readonly kind: 'clothing' | 'den-item' | 'den-room'

  /**
   * Its definition id
   */
  readonly defId: number

  /**
   * Its colour
   */
  readonly color?: number

  /**
   * The den room slot
   */
  readonly slot?: number
}

/**
 * A bundle bought
 */
export type Bundle = {
  /**
   * The shop's list id
   */
  readonly shopId: number

  /**
   * What it costs in diamonds
   */
  readonly diamonds: number

  /**
   * What it holds
   */
  readonly parts: readonly BundlePart[]
}

/**
 * Something a bundle gave
 */
export type BundledPart = BundlePart & {
  /**
   * Where it went in the inventory
   */
  readonly invIdx: number
}

/**
 * What a bundle came to
 */
export type BoughtBundle = {
  /**
   * What it gave
   */
  readonly parts: readonly BundledPart[]

  /**
   * The diamonds left
   */
  readonly diamonds: number
}

/**
 * Handles shop stock
 * @class
 */
export class ShopRepository {
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
   * Lists shop stock
   * @returns The stock
   */
  public async stock(): Promise<ShopStock[]> {
    return this.database.findMany(ShopStock, {
      $sort: { listId: 'asc', position: 'asc', defId: 'asc' },
    })
  }

  /**
   * Puts things on a shop's shelf
   * @param listId The shop's list id
   * @param listType Their kind
   * @param defIds Their definition ids
   * @returns How many were added
   */
  public async addStock(
    listId: number,
    listType: number,
    defIds: readonly number[],
  ): Promise<number> {
    const [last] = await this.database.findMany(ShopStock, {
      $select: { position: true },
      $where: { listId },
      $sort: { position: 'desc' },
      $limit: 1,
    })
    const first = (last?.position ?? -1) + 1

    for (const [index, defId] of defIds.entries()) {
      await this.database.upsertOne(
        ShopStock,
        { listId: true, listType: true, defId: true },
        { listId, listType, defId, position: first + index },
      )
    }

    return defIds.length
  }

  /**
   * Takes things off a shop's shelf
   * @param listId The shop's list id
   * @param defIds Their definition ids, or null
   * @returns How many were taken
   */
  public async removeStock(
    listId: number,
    defIds?: readonly number[],
  ): Promise<number> {
    const $where = defIds ? { listId, defId: { $in: [...defIds] } } : { listId }

    return this.database.deleteMany(ShopStock, { $where })
  }

  /**
   * Pays for something
   * @param gameId The player
   * @param purchase The purchase
   * @returns The purchase, or null
   */
  public async buy(
    gameId: number,
    purchase: Purchase,
  ): Promise<Purchased | null> {
    return this.database.transaction(async (querier) => {
      if (
        purchase.kind === 'den-room' &&
        (await this.slotTaken(querier, gameId, purchase))
      ) {
        return null
      }

      const totals = ShopRepository.totals(purchase.costs)
      if (!(await ShopRepository.pay(querier, gameId, totals))) return null

      const invIdx = await ShopRepository.give(querier, gameId, purchase)
      const balances = await ShopRepository.balances(querier, gameId, [
        ...totals.keys(),
      ])

      const transactionId = await ShopRepository.record(
        querier,
        gameId,
        'buy',
        purchase,
      )
      await ShopRepository.recordCurrencies(
        querier,
        transactionId,
        totals,
        balances,
        -1,
      )
      await querier.insertOne(TransactionItem, {
        transactionId,
        seq: 0,
        itemKind: purchase.kind,
        invIdx,
        defId: purchase.defId,
        color: purchase.color ?? 0,
        version: purchase.version ?? 0,
      })

      return { invIdx, balances }
    })
  }

  /**
   * Exchanges one currency for another
   * @param gameId The player
   * @param exchange The exchange
   * @returns The new balances, or null
   */
  public async exchange(
    gameId: number,
    exchange: CurrencyExchange,
  ): Promise<Partial<Record<Currency, number>> | null> {
    const gained = CURRENCIES[exchange.gain.currency]
    if (!gained || exchange.gain.amount <= 0) return null

    return this.database.transaction(async (querier) => {
      const totals = ShopRepository.totals(exchange.costs)
      if (totals.size === 0) return null
      if (!(await ShopRepository.pay(querier, gameId, totals))) return null

      await querier.updateOneById(Player, gameId, {
        [gained]: { $inc: exchange.gain.amount },
      })

      const balances = await ShopRepository.balances(querier, gameId, [
        ...totals.keys(),
        gained,
      ])
      const transactionId = await ShopRepository.record(
        querier,
        gameId,
        'exchange',
        { shopId: exchange.shopId, diamondDefId: 0 },
      )
      await ShopRepository.recordCurrencies(
        querier,
        transactionId,
        totals,
        balances,
        -1,
      )
      await ShopRepository.recordCurrencies(
        querier,
        transactionId,
        new Map<Currency, number>([[gained, exchange.gain.amount]]),
        balances,
        1,
      )

      return balances
    })
  }

  /**
   * Gives gems away
   * @param gameId The player
   * @param gems How many
   * @returns The gems left, or null
   */
  public async donate(gameId: number, gems: number): Promise<number | null> {
    if (gems <= 0) return null

    return this.database.transaction(async (querier) => {
      const totals = new Map<Currency, number>([['gems', gems]])
      if (!(await ShopRepository.pay(querier, gameId, totals))) return null

      const balances = await ShopRepository.balances(querier, gameId, ['gems'])
      const transactionId = await ShopRepository.record(
        querier,
        gameId,
        'donation',
      )
      await ShopRepository.recordCurrencies(
        querier,
        transactionId,
        totals,
        balances,
        -1,
      )

      return balances.gems ?? 0
    })
  }

  /**
   * Pays for a bundle and gives what it holds
   * @param gameId The player
   * @param bundle The bundle
   * @returns The bundle, or null
   */
  public async buyBundle(
    gameId: number,
    bundle: Bundle,
  ): Promise<BoughtBundle | null> {
    if (bundle.parts.length === 0) return null

    return this.database.transaction(async (querier) => {
      const slots = bundle.parts.flatMap((part) =>
        part.kind === 'den-room' ? [part.slot ?? 0] : [],
      )
      if (
        slots.length > 0 &&
        (await querier.exists(DenRoom, {
          $where: { gameId, invIdx: { $in: slots } },
        }))
      ) {
        return null
      }

      const totals = ShopRepository.totals([
        { currency: CURRENCIES.indexOf('diamonds'), amount: bundle.diamonds },
      ])
      if (!(await ShopRepository.pay(querier, gameId, totals))) return null

      const parts: BundledPart[] = []
      for (const part of bundle.parts) {
        const invIdx = await ShopRepository.give(querier, gameId, {
          ...part,
          shopId: bundle.shopId,
          diamondDefId: 0,
          costs: [],
        })
        parts.push({ ...part, invIdx })
      }

      const balances = await ShopRepository.balances(querier, gameId, [
        'diamonds',
      ])
      const transactionId = await ShopRepository.record(
        querier,
        gameId,
        'bundle',
        { shopId: bundle.shopId, diamondDefId: 0 },
      )
      await ShopRepository.recordCurrencies(
        querier,
        transactionId,
        totals,
        balances,
        -1,
      )
      await querier.insertMany(
        TransactionItem,
        parts.map((part, seq) => ({
          transactionId,
          seq,
          itemKind: part.kind,
          invIdx: part.invIdx,
          defId: part.defId,
          color: part.color ?? 0,
        })),
      )

      return { parts, diamonds: balances.diamonds ?? 0 }
    })
  }

  /**
   * Frames a masterpiece the player just uploaded
   * @param gameId The player
   * @param purchase The frame
   * @param tokenDefId The paying token, or null
   * @returns The total, or null
   */
  public async frame(
    gameId: number,
    purchase: Purchase & { readonly uniqueImageId: string },
    tokenDefId: number | null,
  ): Promise<Framed | null> {
    return this.database.transaction(async (querier) => {
      const { uniqueImageId } = purchase
      const waiting = await querier.exists(Masterpiece, {
        $where: { uniqueImageId, creatorGameId: gameId, status: 'uploaded' },
      })
      if (!waiting) return null

      const token =
        tokenDefId === null
          ? null
          : await querier.findOne(DenItem, {
              $where: {
                gameId,
                defId: tokenDefId,
                categoryId: 0,
                denStoreInvIdx: 0,
              },
              $sort: { invIdx: 'asc' },
            })
      if (tokenDefId !== null && !token) return null

      const totals = token
        ? new Map<Currency, number>()
        : ShopRepository.totals(purchase.costs)
      if (!(await ShopRepository.pay(querier, gameId, totals))) return null

      if (token) {
        await querier.deleteMany(DenItem, {
          $where: { gameId, invIdx: token.invIdx },
        })
        await querier.deleteMany(TradeListing, {
          $where: { gameId, itemKind: 0, invIdx: token.invIdx },
        })
      }

      const invIdx = await ShopRepository.give(querier, gameId, purchase)
      const balances = await ShopRepository.balances(querier, gameId, [
        'diamonds',
      ])

      await querier.updateOneById(Masterpiece, uniqueImageId, {
        status: 'pending',
        diamondsPaid: totals.get('diamonds') ?? 0,
        tokenPaid: token !== null,
      })

      const transactionId = await ShopRepository.record(
        querier,
        gameId,
        'buy',
        purchase,
      )
      await ShopRepository.recordCurrencies(
        querier,
        transactionId,
        totals,
        balances,
        -1,
      )
      await querier.insertOne(TransactionItem, {
        transactionId,
        seq: 0,
        itemKind: purchase.kind,
        invIdx,
        defId: purchase.defId,
        color: 0,
        version: purchase.version ?? 0,
      })

      return { invIdx, balances, tokenInvIdx: token?.invIdx ?? null }
    })
  }

  /**
   * Pays for a pet and adopts it
   * @param gameId The player
   * @param adoption The pet
   * @returns The total, or the refusal
   */
  public async adopt(
    gameId: number,
    adoption: Adoption,
  ): Promise<Adopted | { readonly refusal: 'pets' | 'funds' }> {
    return this.database.transaction(async (querier) => {
      if (
        (await querier.count(Pet, { $where: { gameId } })) >= adoption.limit
      ) {
        return { refusal: 'pets' as const }
      }

      const totals = ShopRepository.totals(adoption.costs)
      if (!(await ShopRepository.pay(querier, gameId, totals))) {
        return { refusal: 'funds' as const }
      }

      const [last] = await querier.findMany(Pet, {
        $select: { invIdx: true },
        $where: { gameId },
        $sort: { invIdx: 'desc' },
        $limit: 1,
      })

      const pet: Pet = {
        gameId,
        invIdx: (last?.invIdx ?? 0) + 1,
        createdTs: Math.floor(Date.now() / 1000),
        name: adoption.name,
        lBits: adoption.lBits >>> 0,
        uBits: adoption.uBits >>> 0,
        eBits: 0,
        masteryCounter: 0,
        personalityDefId: adoption.personalityDefId,
        favoriteToyDefId: adoption.favoriteToyDefId,
        favoriteFoodDefId: adoption.favoriteFoodDefId,
        denStoreInvIdx: 0,
        denCategoryId: 0,
        denX: 0,
        denY: 0,
        denFlipped: 0,
      }
      await querier.insertOne(Pet, pet)
      await querier.updateOneById(Player, gameId, {
        unlockedPets: adoption.unlockedPets,
      })

      const balances = await ShopRepository.balances(querier, gameId, [
        ...totals.keys(),
      ])
      const transactionId = await ShopRepository.record(
        querier,
        gameId,
        'buy',
        {
          kind: 'den-item',
          shopId: adoption.shopId,
          diamondDefId: adoption.diamondDefId,
          costs: adoption.costs,
          defId: pet.lBits & 0xff,
        },
      )
      await ShopRepository.recordCurrencies(
        querier,
        transactionId,
        totals,
        balances,
        -1,
      )
      await querier.insertOne(TransactionItem, {
        transactionId,
        seq: 0,
        itemKind: 'pet',
        invIdx: pet.invIdx,
        defId: pet.lBits & 0xff,
        lBits: pet.lBits,
        uBits: pet.uBits,
      })

      return { pet, balances }
    })
  }

  /**
   * Pays diamonds to host a party
   * @param gameId The player
   * @param diamonds What it costs
   * @returns The diamonds left, or null
   */
  public async payForParty(
    gameId: number,
    diamonds: number,
  ): Promise<number | null> {
    return this.database.transaction(async (querier) => {
      const totals = new Map<Currency, number>([['diamonds', diamonds]])
      if (!(await ShopRepository.pay(querier, gameId, totals))) return null

      const balances = await ShopRepository.balances(querier, gameId, [
        'diamonds',
      ])
      const [row] = await querier.insertMany(
        Transaction,
        [{ gameId, kind: 'party-host' }],
        {
          returning: { id: true },
        },
      )
      await ShopRepository.recordCurrencies(
        querier,
        row?.id ?? 0,
        totals,
        balances,
        -1,
      )

      return balances.diamonds ?? 0
    })
  }

  /**
   * Pays for an animal and adds it
   * @param gameId The player
   * @param purchase The animal
   * @returns The total, or null
   */
  public async buyAnimal(
    gameId: number,
    purchase: AnimalPurchase,
  ): Promise<BoughtAnimal | null> {
    return this.database.transaction(async (querier) => {
      if (
        await querier.exists(Avatar, {
          $where: { gameId, avInvId: purchase.slot },
        })
      ) {
        return null
      }

      const totals = ShopRepository.totals([purchase.cost])
      if (!(await ShopRepository.pay(querier, gameId, totals))) return null

      const [last] = await querier.findMany(Avatar, {
        $select: { perUserAvId: true },
        $where: { gameId },
        $sort: { perUserAvId: 'desc' },
        $limit: 1,
      })
      const perUserAvId = (last?.perUserAvId ?? 0) + 1
      const { look } = purchase
      const [color1, color2, color3] = look.colors

      await querier.insertOne(Avatar, {
        gameId,
        perUserAvId,
        avInvId: purchase.slot,
        avTypeId: look.avTypeId,
        customAvId: look.customAvId,
        color1,
        color2,
        color3,
        avName: look.avName,
        eyesDefId: look.eyesDefId,
        patternDefId: look.patternDefId,
      })
      await querier.updateOneById(Player, gameId, {
        avatarSlotFlags: purchase.avatarSlotFlags,
      })

      const balances = await ShopRepository.balances(querier, gameId, [
        ...totals.keys(),
      ])
      const transactionId = await ShopRepository.record(
        querier,
        gameId,
        'buy',
        purchase,
      )
      await ShopRepository.recordCurrencies(
        querier,
        transactionId,
        totals,
        balances,
        -1,
      )

      const avatar = await querier.findOneById(Avatar, { gameId, perUserAvId })

      return avatar ? { avatar, balances } : null
    })
  }

  /**
   * Removes an animal for gems
   * @param gameId The player
   * @param recycling The animal
   * @returns The gems now, or null
   */
  public async recycleAnimal(
    gameId: number,
    recycling: AnimalRecycling,
  ): Promise<number | null> {
    return this.database.transaction(async (querier) => {
      const taken = await querier.deleteMany(Avatar, {
        $where: { gameId, perUserAvId: recycling.perUserAvId, active: false },
      })
      if (taken === 0) return null

      for (const { invId, equippedAvatars } of recycling.items) {
        await querier.updateMany(
          Item,
          { $where: { gameId, invId } },
          { equippedAvatars },
        )
      }

      const totals = new Map<Currency, number>(
        recycling.gems > 0 ? [['gems', recycling.gems]] : [],
      )
      if (recycling.gems > 0) {
        await querier.updateOneById(Player, gameId, {
          gems: { $inc: recycling.gems },
        })
      }

      const balances = await ShopRepository.balances(querier, gameId, ['gems'])
      const transactionId = await ShopRepository.record(
        querier,
        gameId,
        'recycle',
      )
      await ShopRepository.recordCurrencies(
        querier,
        transactionId,
        totals,
        balances,
        1,
      )

      return balances.gems ?? 0
    })
  }

  /**
   * Pays gems for a photo booth picture
   * @param gameId The player
   * @param gems What it costs
   * @returns The gems left, or null
   */
  public async payForPhoto(
    gameId: number,
    gems: number,
  ): Promise<number | null> {
    return this.database.transaction(async (querier) => {
      const totals = new Map<Currency, number>([['gems', gems]])
      if (!(await ShopRepository.pay(querier, gameId, totals))) return null

      const balances = await ShopRepository.balances(querier, gameId, ['gems'])
      const [row] = await querier.insertMany(
        Transaction,
        [{ gameId, kind: 'photo-booth' }],
        {
          returning: { id: true },
        },
      )
      await ShopRepository.recordCurrencies(
        querier,
        row?.id ?? 0,
        totals,
        balances,
        -1,
      )

      return balances.gems ?? 0
    })
  }

  /**
   * Recycles things for gems
   * @param gameId The player
   * @param kind Their kind
   * @param entries The recycled entries
   * @returns What it came to
   */
  public async recycle(
    gameId: number,
    kind: TransactionItemKind,
    entries: readonly Recycling[],
  ): Promise<Recycled> {
    return this.database.transaction(async (querier) => {
      const recycled: Recycling[] = []

      for (const entry of entries) {
        if (await ShopRepository.take(querier, gameId, kind, entry.invIdx)) {
          recycled.push(entry)
        }
      }

      const gems = recycled.reduce((sum, { gems: each }) => sum + each, 0)
      if (gems > 0) {
        await querier.updateOneById(Player, gameId, { gems: { $inc: gems } })
      }

      const balance =
        (await ShopRepository.balances(querier, gameId, ['gems'])).gems ?? 0
      if (recycled.length === 0) return { recycled: [], gems: balance }

      const transactionId = await ShopRepository.record(
        querier,
        gameId,
        'recycle',
      )
      await querier.insertOne(TransactionCurrency, {
        transactionId,
        currency: 0,
        change: gems,
        balance,
      })
      await querier.insertMany(
        TransactionItem,
        recycled.map((entry, seq) => ({
          transactionId,
          seq,
          itemKind: kind,
          invIdx: entry.invIdx,
          defId: entry.defId,
          gems: entry.gems,
        })),
      )

      return { recycled: recycled.map(({ invIdx }) => invIdx), gems: balance }
    })
  }

  /**
   * Checks a den room slot is taken
   * @param querier The querier
   * @param gameId The player
   * @param purchase The purchase
   * @returns Whether it is taken
   */
  private async slotTaken(
    querier: Querier,
    gameId: number,
    purchase: Purchase,
  ): Promise<boolean> {
    return querier.exists(DenRoom, {
      $where: { gameId, invIdx: purchase.slot ?? 0 },
    })
  }

  /**
   * Adds up the costs by currency
   * @param costs The costs
   * @returns The totals
   */
  private static totals(costs: readonly Payment[]): Map<Currency, number> {
    const totals = new Map<Currency, number>()

    for (const { currency, amount } of costs) {
      const name = CURRENCIES[currency]
      if (name && amount > 0) totals.set(name, (totals.get(name) ?? 0) + amount)
    }

    return totals
  }

  /**
   * Takes the totals from the player
   * @param querier The querier
   * @param gameId The player
   * @param totals What to take
   * @returns Whether it was taken
   */
  private static async pay(
    querier: Querier,
    gameId: number,
    totals: ReadonlyMap<Currency, number>,
  ): Promise<boolean> {
    if (totals.size === 0) return querier.exists(Player, { $where: { gameId } })

    const where: Record<string, unknown> = { gameId }
    const update: Record<string, unknown> = {}

    for (const [currency, amount] of totals) {
      where[currency] = { $gte: amount }
      update[currency] = { $inc: -amount }
    }

    const changed = await querier.updateMany(Player, { $where: where }, update)

    return changed > 0
  }

  /**
   * Delivers a purchase
   * @param querier The querier
   * @param gameId The player
   * @param purchase The purchase
   * @returns Its place in the inventory
   */
  private static async give(
    querier: Querier,
    gameId: number,
    purchase: Purchase,
  ): Promise<number> {
    if (purchase.kind === 'den-room') {
      const invIdx = purchase.slot ?? 0
      await querier.insertOne(DenRoom, {
        gameId,
        invIdx,
        defId: purchase.defId,
      })

      return invIdx
    }

    if (purchase.kind === 'den-item') {
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
        defId: purchase.defId,
        version: purchase.version ?? 0,
        uniqueImageId: purchase.uniqueImageId ?? '',
      })

      return invIdx
    }

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
      defId: purchase.defId,
      color: purchase.color ?? 0,
    })

    return invId
  }

  /**
   * Takes one recycled thing from the player
   * @param querier The querier
   * @param gameId The player
   * @param kind Its kind
   * @param invIdx Its place in the inventory
   * @returns Whether it was taken
   */
  private static async take(
    querier: Querier,
    gameId: number,
    kind: TransactionItemKind,
    invIdx: number,
  ): Promise<boolean> {
    if (kind === 'clothing') {
      return (
        (await querier.deleteMany(Item, {
          $where: { gameId, invId: invIdx, denStoreInvIdx: 0 },
        })) > 0
      )
    }

    if (kind === 'den-room') {
      return (
        (await querier.deleteMany(DenRoom, { $where: { gameId, invIdx } })) > 0
      )
    }

    const taken = await querier.deleteMany(DenItem, {
      $where: { gameId, invIdx, denStoreInvIdx: 0 },
    })
    if (taken === 0) return false

    await ShopRepository.closeStand(querier, gameId, invIdx)

    return true
  }

  /**
   * Takes down a stand
   * @param querier The querier
   * @param gameId The owner
   * @param storeInvIdx The stand
   */
  private static async closeStand(
    querier: Querier,
    gameId: number,
    storeInvIdx: number,
  ): Promise<void> {
    await querier.deleteMany(DenShopListing, {
      $where: { gameId, storeInvIdx },
    })
    await querier.deleteMany(DenShop, { $where: { gameId, storeInvIdx } })
    await querier.updateMany(
      Item,
      { $where: { gameId, denStoreInvIdx: storeInvIdx } },
      { denStoreInvIdx: 0 },
    )
    await querier.updateMany(
      DenItem,
      { $where: { gameId, denStoreInvIdx: storeInvIdx } },
      { denStoreInvIdx: 0 },
    )
  }

  /**
   * Reads some of a player's balances
   * @param querier The querier
   * @param gameId The player
   * @param currencies The currencies
   * @returns The balances
   */
  private static async balances(
    querier: Querier,
    gameId: number,
    currencies: readonly Currency[],
  ): Promise<Partial<Record<Currency, number>>> {
    const player = await querier.findOneById(Player, gameId)
    if (!player) return {}

    return Object.fromEntries(
      currencies.map((currency) => [currency, player[currency]]),
    )
  }

  /**
   * Records a transaction
   * @param querier The querier
   * @param gameId The player
   * @param kind Its purpose
   * @param purchase The purchase
   * @returns The transaction's id
   */
  private static async record(
    querier: Querier,
    gameId: number,
    kind: TransactionKind,
    purchase?:
      Purchase | AnimalPurchase | Pick<Purchase, 'shopId' | 'diamondDefId'>,
  ): Promise<number> {
    const [row] = await querier.insertMany(
      Transaction,
      [
        {
          gameId,
          kind,
          shopId: purchase?.shopId ?? 0,
          diamondDefId: purchase?.diamondDefId ?? 0,
        },
      ],
      { returning: { id: true } },
    )

    return row?.id ?? 0
  }

  /**
   * Records currency changes
   * @param querier The querier
   * @param transactionId The transaction
   * @param totals The amounts by currency
   * @param balances The balances afterwards
   * @param sign 1 in, -1 out
   */
  private static async recordCurrencies(
    querier: Querier,
    transactionId: number,
    totals: ReadonlyMap<Currency, number>,
    balances: Partial<Record<Currency, number>>,
    sign: 1 | -1,
  ): Promise<void> {
    const rows = [...totals].map(([currency, amount]) => ({
      transactionId,
      currency: CURRENCIES.indexOf(currency),
      change: sign * amount,
      balance: balances[currency] ?? 0,
    }))

    if (rows.length > 0) await querier.insertMany(TransactionCurrency, rows)
  }
}
