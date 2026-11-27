import { EcoGift } from '../../entities/gift/index.ts'
import { Player } from '../../entities/player/index.ts'
import { TransactionCurrency } from '../../entities/transactions/currency/index.ts'
import { Transaction } from '../../entities/transactions/transaction/index.ts'
import { type Database } from '../../pool/index.ts'

/**
 * The eco credits currency
 */
const ECO_CREDITS = 11

/**
 * A player's eco credit meter
 */
export type StoredEcoMeter = {
  /**
   * Eco credits earned but not yet redeemed
   */
  readonly unredeemed: number

  /**
   * When eco credits were last earned
   */
  readonly accruedAt: Date | null
}

/**
 * The next eco gift
 */
export type NextEcoGift = {
  /**
   * The gift's bit
   */
  readonly bitIdx: number

  /**
   * The eco score needed
   */
  readonly scoreRequired: number
}

/**
 * An eco gift
 */
export type StoredEcoGift = NextEcoGift & {
  /**
   * The den item it gives
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
 * Keeps den eco systems
 * @class
 */
export class EcoRepository {
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
   * Reads a player's eco credit meter
   * @param gameId The player
   * @returns The meter, or null
   */
  public async meter(gameId: number): Promise<StoredEcoMeter | null> {
    const player = await this.database.findOne(Player, {
      $select: { ecoUnredeemed: true, ecoAccruedAt: true },
      $where: { gameId },
    })
    if (!player) return null

    return {
      unredeemed: player.ecoUnredeemed,
      accruedAt: player.ecoAccruedAt ?? null,
    }
  }

  /**
   * Saves a player's eco credit meter
   * @param gameId The player
   * @param meter The meter
   */
  public async keep(gameId: number, meter: StoredEcoMeter): Promise<void> {
    await this.database.updateOneById(Player, gameId, {
      ecoUnredeemed: meter.unredeemed,
      ecoAccruedAt: meter.accruedAt,
    })
  }

  /**
   * Redeems a player's eco credits
   * @param gameId The player
   * @param owed The eco credits earned
   * @param accruedAt When the meter starts again
   * @returns The eco credits held, or null
   */
  public async redeem(
    gameId: number,
    owed: number,
    accruedAt: Date | null,
  ): Promise<number | null> {
    return this.database.transaction(async (querier) => {
      const player = await querier.findOne(Player, {
        $select: { ecoCredits: true },
        $where: { gameId },
      })
      if (!player || owed <= 0) return null

      const balance = player.ecoCredits + owed
      await querier.updateOneById(Player, gameId, {
        ecoCredits: balance,
        ecoUnredeemed: 0,
        ecoAccruedAt: accruedAt,
      })

      const [row] = await querier.insertMany(
        Transaction,
        [{ gameId, kind: 'eco-credits' }],
        { returning: { id: true } },
      )
      await querier.insertOne(TransactionCurrency, {
        transactionId: row?.id ?? 0,
        currency: ECO_CREDITS,
        change: owed,
        balance,
      })

      return balance
    })
  }

  /**
   * Finds an eco gift
   * @param bitIdx The gift's bit
   * @returns The gift, or null
   */
  public async gift(bitIdx: number): Promise<StoredEcoGift | null> {
    const gift = await this.database.findOne(EcoGift, {
      $select: {
        bitIdx: true,
        scoreRequired: true,
        denItemDefId: true,
        color: true,
        nameStrId: true,
        descStrId: true,
      },
      $where: { bitIdx },
    })

    return gift ?? null
  }

  /**
   * Adds or changes an eco gift
   * @param gift The gift
   */
  public async keepGift(gift: StoredEcoGift): Promise<void> {
    await this.database.transaction(async (querier) => {
      const { bitIdx, ...fields } = gift
      const found = await querier.findOneById(EcoGift, bitIdx)

      if (found) await querier.updateOneById(EcoGift, bitIdx, fields)
      else await querier.insertOne(EcoGift, gift)
    })
  }

  /**
   * Finds the next eco gift
   * @param had The gift bits had
   * @returns The gift, or null
   */
  public async nextGift(had: number): Promise<NextEcoGift | null> {
    const gifts = await this.database.findMany(EcoGift, {
      $select: { bitIdx: true, scoreRequired: true },
      $sort: { bitIdx: 'asc' },
    })
    const next = gifts.find(({ bitIdx }) => ((had >>> bitIdx) & 1) === 0)

    return next
      ? { bitIdx: next.bitIdx, scoreRequired: next.scoreRequired }
      : null
  }
}
