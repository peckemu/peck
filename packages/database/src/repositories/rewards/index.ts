import { AccountType } from '@peck/shared'

import { type CodeItem } from '#database/entities/codes/code'
import { DenItem } from '#database/entities/den/item'
import { Item } from '#database/entities/item'
import { Player } from '#database/entities/player'
import { type Database, type Querier } from '#database/pool'

/**
 * What a reward gives
 */
export type Reward = {
  /**
   * The gems
   */
  readonly gems: number

  /**
   * The diamonds
   */
  readonly diamonds: number

  /**
   * The membership days
   */
  readonly membershipDays: number

  /**
   * The things
   */
  readonly items: readonly CodeItem[]
}

/**
 * A thing a reward gave
 */
export type GrantedItem = CodeItem & {
  /**
   * Its place in the inventory
   */
  readonly invIdx: number
}

/**
 * What a reward came to
 */
export type GrantedReward = {
  /**
   * The gems balance, or null
   */
  readonly gems: number | null

  /**
   * The diamonds balance, or null
   */
  readonly diamonds: number | null

  /**
   * The membership days given
   */
  readonly membershipDays: number

  /**
   * The account type now
   */
  readonly accountType: number

  /**
   * The things given
   */
  readonly items: readonly GrantedItem[]
}

/**
 * Gives rewards to players
 * @class
 */
export class RewardRepository {
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
   * Gives a reward
   * @param gameId The player
   * @param reward The reward
   * @returns What it came to
   */
  public async grant(gameId: number, reward: Reward): Promise<GrantedReward> {
    return this.database.transaction(async (querier) =>
      RewardRepository.within(querier, gameId, reward),
    )
  }

  /**
   * Gives a reward inside a transaction
   * @param querier The querier
   * @param gameId The player
   * @param reward The reward
   * @returns What it came to
   */
  public static async within(
    querier: Querier,
    gameId: number,
    reward: Reward,
  ): Promise<GrantedReward> {
    const update: Record<string, unknown> = {}
    if (reward.gems > 0) update['gems'] = { $inc: reward.gems }
    if (reward.diamonds > 0) update['diamonds'] = { $inc: reward.diamonds }
    if (Object.keys(update).length > 0) {
      await querier.updateOneById(Player, gameId, update)
    }

    const found = await querier.findOneById(Player, gameId)
    if (!found) throw new Error('Player is missing')

    if (reward.membershipDays > 0) {
      await querier.updateMany(
        Player,
        {
          $where: {
            accountId: found.accountId,
            accountType: { $lt: AccountType.Member },
          },
        },
        { accountType: AccountType.Member },
      )
    }

    const items = await RewardRepository.give(querier, gameId, reward.items)
    const player = await querier.findOneById(Player, gameId)
    if (!player) throw new Error('Player is missing')

    return {
      gems: reward.gems > 0 ? player.gems : null,
      diamonds: reward.diamonds > 0 ? player.diamonds : null,
      membershipDays: reward.membershipDays,
      accountType: player.accountType,
      items,
    }
  }

  /**
   * Gives clothing and den items
   * @param querier The querier
   * @param gameId The player
   * @param items The things
   * @returns The things given
   */
  private static async give(
    querier: Querier,
    gameId: number,
    items: readonly CodeItem[],
  ): Promise<GrantedItem[]> {
    if (items.length === 0) return []

    const [lastItem] = await querier.findMany(Item, {
      $select: { invId: true },
      $where: { gameId },
      $sort: { invId: 'desc' },
      $limit: 1,
    })
    const [lastDenItem] = await querier.findMany(DenItem, {
      $select: { invIdx: true },
      $where: { gameId },
      $sort: { invIdx: 'desc' },
      $limit: 1,
    })

    let nextItem = (lastItem?.invId ?? 0) + 1
    let nextDenItem = (lastDenItem?.invIdx ?? 0) + 1
    const given: GrantedItem[] = []

    for (const item of items) {
      if (item.kind === 'clothing') {
        const invIdx = nextItem++
        await querier.insertOne(Item, {
          gameId,
          invId: invIdx,
          defId: item.defId,
          color: item.color,
        })
        given.push({ ...item, invIdx })
        continue
      }

      const invIdx = nextDenItem++
      await querier.insertOne(DenItem, { gameId, invIdx, defId: item.defId })
      given.push({ ...item, invIdx })
    }

    return given
  }
}
