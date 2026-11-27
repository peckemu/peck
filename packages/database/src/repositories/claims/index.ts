import { WorldItemClaim } from '../../entities/claim/index.ts'
import { DenItem } from '../../entities/den/item/index.ts'
import { Item } from '../../entities/item/index.ts'
import { Player } from '../../entities/player/index.ts'
import { UserVariable } from '../../entities/variable/index.ts'
import { type Database, type Querier } from '../../pool/index.ts'

/**
 * The bit field variable type
 */
const BIT_FIELD = 3

/**
 * What a world item gives
 */
export type ClaimGift =
  | {
      /**
       * A currency
       */
      readonly kind: 'gems' | 'diamonds'

      /**
       * How much
       */
      readonly amount: number
    }
  | {
      /**
       * A thing
       */
      readonly kind: 'clothing' | 'den-item'

      /**
       * Its definition id
       */
      readonly defId: number

      /**
       * The clothing colour
       */
      readonly color: number

      /**
       * The den item version
       */
      readonly version: number
    }

/**
 * A world item picked up
 */
export type Claim = {
  /**
   * The world item's definition id
   */
  readonly worldItemDefId: number

  /**
   * The user variable it is kept in
   */
  readonly varId: number

  /**
   * Its bit in the user variable
   */
  readonly bit: number

  /**
   * What it gives
   */
  readonly gift: ClaimGift
}

/**
 * What picking up a world item came to
 */
export type Claimed = {
  /**
   * The currency balance, or -1
   */
  readonly balance: number

  /**
   * The new thing's place in the inventory, or 0
   */
  readonly invIdx: number

  /**
   * The user variable's type
   */
  readonly type: number

  /**
   * The user variable's value now
   */
  readonly value: number
}

/**
 * Keeps the world items players picked up
 * @class
 */
export class ClaimRepository {
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
   * Picks up a world item and gives its gift
   * @param gameId The player
   * @param claim The world item
   * @returns What it came to, or null
   */
  public async claim(gameId: number, claim: Claim): Promise<Claimed | null> {
    return this.database.transaction(async (querier) => {
      await querier.all`SELECT game_id FROM players WHERE game_id = ${gameId} FOR UPDATE`

      const { worldItemDefId, varId, bit } = claim
      const taken = await querier.exists(WorldItemClaim, {
        $where: { gameId, worldItemDefId },
      })
      if (taken) return null

      const kept = await querier.findOne(UserVariable, {
        $where: { gameId, varId },
      })
      const previous = kept && kept.value !== -1 ? kept.value : 0
      if (Math.floor(previous / 2 ** bit) % 2 === 1) return null

      await querier.insertOne(WorldItemClaim, { gameId, worldItemDefId })

      const value = previous + 2 ** bit
      const type = kept?.type ?? BIT_FIELD
      await querier.upsertOne(
        UserVariable,
        { gameId: true, varId: true },
        { gameId, varId, type, value, updatedAt: new Date() },
      )

      const given = await ClaimRepository.give(querier, gameId, claim.gift)

      return { ...given, type, value }
    })
  }

  /**
   * Gives a world item's gift
   * @param querier The querier
   * @param gameId The player
   * @param gift The gift
   * @returns The balance and the new thing
   */
  private static async give(
    querier: Querier,
    gameId: number,
    gift: ClaimGift,
  ): Promise<{ readonly balance: number; readonly invIdx: number }> {
    if ('amount' in gift) {
      await querier.updateOneById(Player, gameId, {
        [gift.kind]: { $inc: gift.amount },
      })
      const player = await querier.findOneById(Player, gameId)
      if (!player) throw new Error('Player is missing')

      return { balance: player[gift.kind], invIdx: 0 }
    }

    if (gift.kind === 'den-item') {
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
        defId: gift.defId,
        version: gift.version,
      })

      return { balance: -1, invIdx }
    }

    const [last] = await querier.findMany(Item, {
      $select: { invId: true },
      $where: { gameId },
      $sort: { invId: 'desc' },
      $limit: 1,
    })
    const invIdx = (last?.invId ?? 0) + 1
    await querier.insertOne(Item, {
      gameId,
      invId: invIdx,
      defId: gift.defId,
      color: gift.color,
    })

    return { balance: -1, invIdx }
  }
}
