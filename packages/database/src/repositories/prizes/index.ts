import { DenItem } from '#database/entities/den/item'
import { ItemPrize, type PrizeSource } from '#database/entities/prize'
import { TransactionItem } from '#database/entities/transactions/item'
import { Transaction } from '#database/entities/transactions/transaction'
import { type Database } from '#database/pool'

/**
 * A prize to offer
 */
export type PrizeOffer = {
  /**
   * The player
   */
  readonly gameId: number

  /**
   * The user variable the answer sets
   */
  readonly userVarId: number

  /**
   * The den item
   */
  readonly denItemDefId: number

  /**
   * Its colour
   */
  readonly color: number

  /**
   * Its name string
   */
  readonly nameStrId: number

  /**
   * Its description string
   */
  readonly descStrId: number

  /**
   * Where it came from
   */
  readonly source: PrizeSource

  /**
   * What earned it
   */
  readonly sourceRef: number
}

/**
 * A prize waiting for an answer
 */
export type WaitingPrize = {
  /**
   * Its id
   */
  readonly id: number

  /**
   * The user variable the answer sets
   */
  readonly userVarId: number

  /**
   * The den item
   */
  readonly denItemDefId: number

  /**
   * Its colour
   */
  readonly color: number

  /**
   * Its name string
   */
  readonly nameStrId: number

  /**
   * Its description string
   */
  readonly descStrId: number
}

/**
 * An answered prize
 */
export type AnsweredPrize = {
  /**
   * The prize
   */
  readonly prize: WaitingPrize

  /**
   * The kept den item's place, or null
   */
  readonly invIdx: number | null
}

/**
 * The waiting prize fields
 */
const WAITING = {
  id: true,
  userVarId: true,
  denItemDefId: true,
  color: true,
  nameStrId: true,
  descStrId: true,
} as const

/**
 * Keeps prizes offered to players
 * @class
 */
export class PrizeRepository {
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
   * Offers a prize
   * @param offer The prize
   * @returns The prize, or null
   */
  public async offer(offer: PrizeOffer): Promise<WaitingPrize | null> {
    return this.database.transaction(async (querier) => {
      const waiting = await querier.exists(ItemPrize, {
        $where: {
          gameId: offer.gameId,
          userVarId: offer.userVarId,
          answeredAt: null,
        },
      })
      if (waiting) return null

      const [row] = await querier.insertMany(ItemPrize, [offer], {
        returning: { id: true },
      })

      return {
        id: row?.id ?? 0,
        userVarId: offer.userVarId,
        denItemDefId: offer.denItemDefId,
        color: offer.color,
        nameStrId: offer.nameStrId,
        descStrId: offer.descStrId,
      }
    })
  }

  /**
   * Lists a player's waiting prizes
   * @param gameId The player
   * @returns The prizes, oldest first
   */
  public async waiting(gameId: number): Promise<WaitingPrize[]> {
    return this.database.findMany(ItemPrize, {
      $select: WAITING,
      $where: { gameId, answeredAt: null },
      $sort: { id: 'asc' },
    })
  }

  /**
   * Answers a waiting prize
   * @param gameId The player
   * @param userVarId The user variable it sets
   * @param kept Whether it is kept
   * @returns The answered prize, or null
   */
  public async answer(
    gameId: number,
    userVarId: number,
    kept: boolean,
  ): Promise<AnsweredPrize | null> {
    return this.database.transaction(async (querier) => {
      const prize = await querier.findOne(ItemPrize, {
        $select: { ...WAITING, source: true },
        $where: { gameId, userVarId, answeredAt: null },
      })
      if (!prize) return null

      const changed = await querier.updateMany(
        ItemPrize,
        { $where: { id: prize.id, answeredAt: null } },
        { answeredAt: new Date(), kept },
      )
      if (changed === 0) return null

      const waiting: WaitingPrize = {
        id: prize.id,
        userVarId: prize.userVarId,
        denItemDefId: prize.denItemDefId,
        color: prize.color,
        nameStrId: prize.nameStrId,
        descStrId: prize.descStrId,
      }
      if (!kept) return { prize: waiting, invIdx: null }

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
        defId: prize.denItemDefId,
      })

      const [row] = await querier.insertMany(
        Transaction,
        [{ gameId, kind: prize.source }],
        { returning: { id: true } },
      )
      await querier.insertOne(TransactionItem, {
        transactionId: row?.id ?? 0,
        seq: 0,
        itemKind: 'den-item',
        invIdx,
        defId: prize.denItemDefId,
        color: prize.color,
        version: 0,
      })

      return { prize: waiting, invIdx }
    })
  }
}
