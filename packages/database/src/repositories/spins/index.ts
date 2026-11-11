import { CURRENCIES, type Currency } from '@peck/shared'

import { Item } from '#database/entities/item'
import { Player } from '#database/entities/player'
import { TransactionCurrency } from '#database/entities/transactions/currency'
import { TransactionItem } from '#database/entities/transactions/item'
import { Transaction } from '#database/entities/transactions/transaction'
import { UserVariable } from '#database/entities/variable'
import { type Querier, type Database } from '#database/pool'

/**
 * A clothing present
 */
export type SpinGift = {
  /**
   * Its definition id
   */
  readonly defId: number

  /**
   * Its colour
   */
  readonly color: number
}

/**
 * A daily spin
 */
export type Spin = {
  /**
   * The daily gem bonus variable
   */
  readonly varId: number

  /**
   * The bonus the player had
   */
  readonly previous: number | null

  /**
   * The new bonus's type
   */
  readonly type: number

  /**
   * The new bonus
   */
  readonly value: number

  /**
   * The currency paid
   */
  readonly currency: Currency | null

  /**
   * How much is paid
   */
  readonly amount: number

  /**
   * The presents given
   */
  readonly gifts: readonly SpinGift[]
}

/**
 * What a spin paid
 */
export type Spun = {
  /**
   * The balance paid into
   */
  readonly balance: number

  /**
   * The presents given
   */
  readonly items: readonly (SpinGift & { readonly invId: number })[]
}

/**
 * Keeps daily spins
 * @class
 */
export class SpinRepository {
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
   * Pays a daily spin
   * @param gameId The player
   * @param spin The spin
   * @returns What it paid, or null
   */
  public async spin(gameId: number, spin: Spin): Promise<Spun | null> {
    return this.database.transaction(async (querier) => {
      await querier.all`SELECT game_id FROM players WHERE game_id = ${gameId} FOR UPDATE`

      const kept = await querier.findOne(UserVariable, {
        $where: { gameId, varId: spin.varId },
      })
      if ((kept?.value ?? null) !== spin.previous) return null

      if (spin.currency !== null && spin.amount > 0) {
        await querier.updateOneById(Player, gameId, {
          [spin.currency]: { $inc: spin.amount },
        })
      }

      const items = await SpinRepository.give(querier, gameId, spin.gifts)
      const player = await querier.findOneById(Player, gameId)
      if (!player) return null

      const balance = spin.currency === null ? 0 : player[spin.currency]

      await querier.upsertOne(
        UserVariable,
        { gameId: true, varId: true },
        {
          gameId,
          varId: spin.varId,
          type: spin.type,
          value: spin.value,
          updatedAt: new Date(),
        },
      )
      await SpinRepository.record(querier, gameId, spin, balance, items)

      return { balance, items }
    })
  }

  /**
   * Gives the presents
   * @param querier The querier
   * @param gameId The player
   * @param gifts The presents
   * @returns The items given
   */
  private static async give(
    querier: Querier,
    gameId: number,
    gifts: readonly SpinGift[],
  ): Promise<(SpinGift & { readonly invId: number })[]> {
    if (gifts.length === 0) return []

    const [last] = await querier.findMany(Item, {
      $select: { invId: true },
      $where: { gameId },
      $sort: { invId: 'desc' },
      $limit: 1,
    })
    const first = (last?.invId ?? 0) + 1
    const items = gifts.map((gift, index) => ({
      ...gift,
      invId: first + index,
    }))

    await querier.insertMany(
      Item,
      items.map(({ invId, defId, color }) => ({ gameId, invId, defId, color })),
    )

    return items
  }

  /**
   * Records the spin
   * @param querier The querier
   * @param gameId The player
   * @param spin The spin
   * @param balance The balance paid into
   * @param items The presents given
   */
  private static async record(
    querier: Querier,
    gameId: number,
    spin: Spin,
    balance: number,
    items: readonly (SpinGift & { readonly invId: number })[],
  ): Promise<void> {
    const [row] = await querier.insertMany(
      Transaction,
      [{ gameId, kind: 'daily-spin' }],
      { returning: { id: true } },
    )
    const transactionId = row?.id ?? 0

    if (spin.currency !== null && spin.amount > 0) {
      await querier.insertOne(TransactionCurrency, {
        transactionId,
        currency: CURRENCIES.indexOf(spin.currency),
        change: spin.amount,
        balance,
      })
    }

    if (items.length > 0) {
      await querier.insertMany(
        TransactionItem,
        items.map(({ invId, defId, color }, seq) => ({
          transactionId,
          seq,
          itemKind: 'clothing' as const,
          invIdx: invId,
          defId,
          color,
          version: 0,
        })),
      )
    }
  }
}
