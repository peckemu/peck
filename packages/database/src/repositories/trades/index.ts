import { TradeKind } from '@peck/shared'

import { Avatar } from '#database/entities/avatar'
import { Block } from '#database/entities/buddies/block'
import { DenItem } from '#database/entities/den/item'
import { DenShop } from '#database/entities/den/shop'
import { Item } from '#database/entities/item'
import { Pet } from '#database/entities/pet'
import { TradeItem } from '#database/entities/trade/item'
import { TradeListing } from '#database/entities/trade/listing'
import { Trade } from '#database/entities/trade/trade'
import { type Database, type Querier } from '#database/pool'

/**
 * The most a trade list holds
 */
const MOST_LISTED = 200

/**
 * The most a player can offer
 */
const MOST_OFFERED = 20

/**
 * A tradeable thing
 */
export type TradeRef = {
  /**
   * Its kind
   */
  readonly kind: number

  /**
   * Its place in the inventory
   */
  readonly invIdx: number
}

/**
 * How much a player can own
 */
export type TradeLimits = {
  /**
   * Clothing
   */
  readonly clothing: number

  /**
   * Den items
   */
  readonly denItems: number

  /**
   * Pets
   */
  readonly pets: number
}

/**
 * A trade to make
 */
export type TradeRequest = {
  /**
   * The asker
   */
  readonly requester: number

  /**
   * The player asked
   */
  readonly owner: number

  /**
   * What the requester wants
   */
  readonly wanted: TradeRef

  /**
   * What the requester gives
   */
  readonly offered: readonly TradeRef[]

  /**
   * How much the requester can own
   */
  readonly requesterLimits: TradeLimits

  /**
   * How much the owner can own
   */
  readonly ownerLimits: TradeLimits
}

/**
 * A transfer
 */
export type Moved = {
  /**
   * Its kind
   */
  readonly kind: TradeKind

  /**
   * Its place in the giver's inventory
   */
  readonly fromInvIdx: number

  /**
   * Its place in the receiver's inventory
   */
  readonly invIdx: number

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
   * The pet
   */
  readonly pet: Pet | null
}

/**
 * Why a trade was refused
 */
export type TradeRefusal =
  'blocked' | 'not-listed' | 'offer' | 'item' | 'pet-in-use' | 'full'

/**
 * What a trade came to
 */
export type TradeOutcome =
  | {
      readonly ok: true
      readonly toRequester: readonly Moved[]
      readonly toOwner: readonly Moved[]
    }
  | {
      readonly ok: false
      readonly refusal: TradeRefusal
      readonly side: 'requester' | 'owner' | null
    }

/**
 * A trade refusal
 * @class
 */
class Refused extends Error {
  /**
   * Why
   */
  public readonly refusal: TradeRefusal

  /**
   * The player's side
   */
  public readonly side: 'requester' | 'owner' | null

  /**
   * Creates the refusal
   * @param refusal Why
   * @param side The player's side
   */
  public constructor(
    refusal: TradeRefusal,
    side: 'requester' | 'owner' | null,
  ) {
    super(refusal)
    this.refusal = refusal
    this.side = side
  }
}

/**
 * Trade lists and trades
 * @class
 */
export class TradeRepository {
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
   * Changes a player's trade list
   * @param gameId The player
   * @param removed What comes off
   * @param added What goes on
   * @returns The trade list afterwards
   */
  public async changeList(
    gameId: number,
    removed: readonly TradeRef[],
    added: readonly TradeRef[],
  ): Promise<TradeRef[]> {
    return this.database.transaction(async (querier) => {
      for (const { kind, invIdx } of removed) {
        await querier.deleteMany(TradeListing, {
          $where: { gameId, itemKind: kind, invIdx },
        })
      }

      for (const ref of added) {
        if (
          (await querier.count(TradeListing, { $where: { gameId } })) >=
          MOST_LISTED
        ) {
          break
        }
        if (!(await TradeRepository.tradeable(querier, gameId, ref))) continue

        await querier.upsertOne(
          TradeListing,
          { gameId: true, itemKind: true, invIdx: true },
          { gameId, itemKind: ref.kind, invIdx: ref.invIdx },
        )
      }

      const rows = await querier.findMany(TradeListing, {
        $where: { gameId },
        $sort: { addedAt: 'asc', itemKind: 'asc', invIdx: 'asc' },
      })

      return rows.map(({ itemKind, invIdx }) => ({ kind: itemKind, invIdx }))
    })
  }

  /**
   * Makes a trade
   * @param request The trade
   * @returns What it came to
   */
  public async trade(request: TradeRequest): Promise<TradeOutcome> {
    try {
      return await this.database.transaction(async (querier) => {
        const { requester, owner } = request
        const [first, second] =
          requester < owner ? [requester, owner] : [owner, requester]
        await querier.all`SELECT game_id FROM players WHERE game_id IN (${first}, ${second}) ORDER BY game_id FOR UPDATE`

        const blocked = await querier.exists(Block, {
          $where: {
            blockerGameId: { $in: [requester, owner] },
            blockedGameId: { $in: [requester, owner] },
          },
        })
        if (blocked) throw new Refused('blocked', null)

        const listed = await querier.exists(TradeListing, {
          $where: {
            gameId: owner,
            itemKind: request.wanted.kind,
            invIdx: request.wanted.invIdx,
          },
        })
        if (!listed) throw new Refused('not-listed', 'owner')

        if (!TradeRepository.validOffer(request.offered)) {
          throw new Refused('offer', 'requester')
        }

        await TradeRepository.check(querier, owner, request.wanted, 'owner')
        for (const ref of request.offered) {
          await TradeRepository.check(querier, requester, ref, 'requester')
        }

        await TradeRepository.fits(
          querier,
          requester,
          [request.wanted],
          request.offered,
          request.requesterLimits,
          'requester',
        )
        await TradeRepository.fits(
          querier,
          owner,
          request.offered,
          [request.wanted],
          request.ownerLimits,
          'owner',
        )

        const [trade] = await querier.insertMany(
          Trade,
          [{ fromGameId: requester, toGameId: owner }],
          {
            returning: { id: true },
          },
        )
        const tradeId = trade?.id ?? 0

        const toRequester = [
          await TradeRepository.move(
            querier,
            tradeId,
            owner,
            requester,
            request.wanted,
          ),
        ]
        const toOwner: Moved[] = []
        for (const ref of request.offered) {
          toOwner.push(
            await TradeRepository.move(querier, tradeId, requester, owner, ref),
          )
        }

        return { ok: true as const, toRequester, toOwner }
      })
    } catch (error) {
      if (error instanceof Refused) {
        return { ok: false, refusal: error.refusal, side: error.side }
      }
      throw error
    }
  }

  /**
   * Checks an offer's size
   * @param offered The offer
   * @returns Whether it is
   */
  private static validOffer(offered: readonly TradeRef[]): boolean {
    const keys = new Set(
      offered.map(({ kind, invIdx }) => `${String(kind)}:${String(invIdx)}`),
    )
    const kinds = offered.every(({ kind }) => kind >= 0 && kind <= 2)

    return (
      offered.length >= 1 &&
      offered.length <= MOST_OFFERED &&
      keys.size === offered.length &&
      kinds
    )
  }

  /**
   * Checks something can change hands
   * @param querier The querier
   * @param gameId The giver
   * @param ref What it is
   * @param side Which player gives it
   */
  private static async check(
    querier: Querier,
    gameId: number,
    ref: TradeRef,
    side: 'requester' | 'owner',
  ): Promise<void> {
    if (!(await TradeRepository.tradeable(querier, gameId, ref))) {
      throw new Refused('item', side)
    }

    if (ref.kind === TradeKind.Pet) {
      const inUse = await querier.exists(Avatar, {
        $where: {
          gameId,
          active: true,
          $or: [{ landPetInvIdx: ref.invIdx }, { oceanPetInvIdx: ref.invIdx }],
        },
      })
      if (inUse) throw new Refused('pet-in-use', side)
    }
  }

  /**
   * Checks a player has room
   * @param querier The querier
   * @param gameId The player
   * @param coming What they get
   * @param going What they give
   * @param limits How much they can own
   * @param side The player's side
   */
  private static async fits(
    querier: Querier,
    gameId: number,
    coming: readonly TradeRef[],
    going: readonly TradeRef[],
    limits: TradeLimits,
    side: 'requester' | 'owner',
  ): Promise<void> {
    const count = (refs: readonly TradeRef[], kind: number): number =>
      refs.filter((ref) => ref.kind === kind).length

    const held = {
      [TradeKind.Clothing]: await querier.count(Item, { $where: { gameId } }),
      [TradeKind.DenItem]: await querier.count(DenItem, { $where: { gameId } }),
      [TradeKind.Pet]: await querier.count(Pet, { $where: { gameId } }),
    }
    const most = {
      [TradeKind.Clothing]: limits.clothing,
      [TradeKind.DenItem]: limits.denItems,
      [TradeKind.Pet]: limits.pets,
    }

    for (const kind of [TradeKind.Clothing, TradeKind.DenItem, TradeKind.Pet]) {
      const gets = count(coming, kind)
      if (gets > 0 && held[kind] - count(going, kind) + gets > most[kind]) {
        throw new Refused('full', side)
      }
    }
  }

  /**
   * Checks something can be traded
   * @param querier The querier
   * @param gameId The owner
   * @param ref What it is
   * @returns Whether it can
   */
  private static async tradeable(
    querier: Querier,
    gameId: number,
    ref: TradeRef,
  ): Promise<boolean> {
    const { kind, invIdx } = ref

    if (kind === TradeKind.Clothing) {
      return querier.exists(Item, {
        $where: { gameId, invId: invIdx, denStoreInvIdx: 0 },
      })
    }

    if (kind === TradeKind.Pet) {
      return querier.exists(Pet, {
        $where: { gameId, invIdx, denStoreInvIdx: 0 },
      })
    }

    if (kind !== TradeKind.DenItem) return false

    const item = await querier.exists(DenItem, {
      $where: { gameId, invIdx, denStoreInvIdx: 0 },
    })
    const stand = await querier.exists(DenShop, {
      $where: { gameId, storeInvIdx: invIdx },
    })

    return item && !stand
  }

  /**
   * Moves one thing to its new owner
   * @param querier The querier
   * @param tradeId The trade
   * @param from The giver
   * @param to The receiver
   * @param ref What it is
   * @returns What moved
   */
  private static async move(
    querier: Querier,
    tradeId: number,
    from: number,
    to: number,
    ref: TradeRef,
  ): Promise<Moved> {
    const moved = await TradeRepository.moveRow(querier, from, to, ref)

    await querier.deleteMany(TradeListing, {
      $where: { gameId: from, itemKind: ref.kind, invIdx: ref.invIdx },
    })
    await querier.insertOne(TradeItem, {
      tradeId,
      fromGameId: from,
      itemKind: ref.kind,
      invIdx: ref.invIdx,
      givenInvIdx: moved.invIdx,
      defId: moved.defId,
      color: moved.color,
      version: moved.version,
      lBits: moved.pet?.lBits ?? 0,
      uBits: moved.pet?.uBits ?? 0,
      eBits: moved.pet?.eBits ?? 0,
    })

    return moved
  }

  /**
   * Moves the row
   * @param querier The querier
   * @param from The giver
   * @param to The receiver
   * @param ref What it is
   * @returns What moved
   */
  private static async moveRow(
    querier: Querier,
    from: number,
    to: number,
    ref: TradeRef,
  ): Promise<Moved> {
    const base = { fromInvIdx: ref.invIdx, color: 0, version: 0, pet: null }

    if (ref.kind === TradeKind.Clothing) {
      const item = await querier.findOne(Item, {
        $where: { gameId: from, invId: ref.invIdx },
      })
      if (!item) throw new Refused('item', null)

      await querier.deleteMany(Item, {
        $where: { gameId: from, invId: ref.invIdx },
      })
      const [last] = await querier.findMany(Item, {
        $select: { invId: true },
        $where: { gameId: to },
        $sort: { invId: 'desc' },
        $limit: 1,
      })
      const invIdx = (last?.invId ?? 0) + 1
      await querier.insertOne(Item, {
        gameId: to,
        invId: invIdx,
        defId: item.defId,
        color: item.color,
      })

      return {
        ...base,
        kind: TradeKind.Clothing,
        invIdx,
        defId: item.defId,
        color: item.color,
      }
    }

    if (ref.kind === TradeKind.DenItem) {
      const item = await querier.findOne(DenItem, {
        $where: { gameId: from, invIdx: ref.invIdx },
      })
      if (!item) throw new Refused('item', null)

      await querier.deleteMany(DenItem, {
        $where: { gameId: from, invIdx: ref.invIdx },
      })
      const [last] = await querier.findMany(DenItem, {
        $select: { invIdx: true },
        $where: { gameId: to },
        $sort: { invIdx: 'desc' },
        $limit: 1,
      })
      const invIdx = (last?.invIdx ?? 0) + 1
      await querier.insertOne(DenItem, {
        gameId: to,
        invIdx,
        defId: item.defId,
        version: item.version,
        userNameLink: item.userNameLink,
        uniqueImageId: item.uniqueImageId,
      })

      return {
        ...base,
        kind: TradeKind.DenItem,
        invIdx,
        defId: item.defId,
        version: item.version,
      }
    }

    const pet = await querier.findOne(Pet, {
      $where: { gameId: from, invIdx: ref.invIdx },
    })
    if (!pet) throw new Refused('item', null)

    await querier.deleteMany(Pet, {
      $where: { gameId: from, invIdx: ref.invIdx },
    })
    await querier.updateMany(
      Avatar,
      { $where: { gameId: from, landPetInvIdx: ref.invIdx } },
      { landPetInvIdx: 0 },
    )
    await querier.updateMany(
      Avatar,
      { $where: { gameId: from, oceanPetInvIdx: ref.invIdx } },
      { oceanPetInvIdx: 0 },
    )

    const [last] = await querier.findMany(Pet, {
      $select: { invIdx: true },
      $where: { gameId: to },
      $sort: { invIdx: 'desc' },
      $limit: 1,
    })
    const given: Pet = {
      createdTs: pet.createdTs,
      name: pet.name,
      lBits: pet.lBits,
      uBits: pet.uBits,
      eBits: pet.eBits,
      masteryCounter: pet.masteryCounter,
      personalityDefId: pet.personalityDefId,
      favoriteToyDefId: pet.favoriteToyDefId,
      favoriteFoodDefId: pet.favoriteFoodDefId,
      gameId: to,
      invIdx: (last?.invIdx ?? 0) + 1,
      denStoreInvIdx: 0,
      denCategoryId: 0,
      denX: 0,
      denY: 0,
      denFlipped: 0,
    }
    await querier.insertOne(Pet, given)

    return {
      ...base,
      kind: TradeKind.Pet,
      invIdx: given.invIdx,
      defId: given.lBits & 0xff,
      pet: given,
    }
  }
}
