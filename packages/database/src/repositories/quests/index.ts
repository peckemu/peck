import { Avatar } from '../../entities/avatar/index.ts'
import {
  QuestDefinition,
  type StoredPrize,
} from '../../entities/definitions/quest/index.ts'
import { DenItem } from '../../entities/den/item/index.ts'
import { Item } from '../../entities/item/index.ts'
import { Player } from '../../entities/player/index.ts'
import { QuestCompletion } from '../../entities/quest/completion/index.ts'
import { QuestPrize } from '../../entities/quest/prize/index.ts'
import { type Database, type Querier } from '../../pool/index.ts'

/**
 * A den item prize
 */
const DEN_ITEM = 1

/**
 * A clothing prize
 */
const CLOTHING = 2

/**
 * A gems prize
 */
const GEMS = 3

/**
 * A crystals prize
 */
const CRYSTALS = 4

/**
 * What an adventure prize came to
 */
export type QuestWin = {
  /**
   * The new item's place, or null
   */
  readonly invId: number | null

  /**
   * The new balance, or null
   */
  readonly balance: number | null
}

/**
 * Adventure progress and prizes
 * @class
 */
export class QuestRepository {
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
   * Lists every adventure
   * @returns The adventures
   */
  public async definitions(): Promise<QuestDefinition[]> {
    return this.database.findMany(QuestDefinition, {
      $sort: { defId: 'asc' },
    })
  }

  /**
   * Gives a player a prize
   * @param gameId The player
   * @param defId The adventure
   * @param prize The prize
   * @returns What it came to
   */
  public async win(
    gameId: number,
    defId: number,
    prize: StoredPrize,
  ): Promise<QuestWin> {
    const color = (prize.color ?? 0) >>> 0

    return this.database.transaction(async (querier) => {
      await querier.insertOne(QuestPrize, {
        gameId,
        defId,
        kind: prize.kind,
        value: prize.value,
        color,
      })

      switch (prize.kind) {
        case CLOTHING:
          return {
            invId: await QuestRepository.clothing(
              querier,
              gameId,
              prize.value,
              color,
            ),
            balance: null,
          }
        case DEN_ITEM:
          return {
            invId: await QuestRepository.denItem(querier, gameId, prize.value),
            balance: null,
          }
        case GEMS:
        case CRYSTALS:
          return {
            invId: null,
            balance: await QuestRepository.pay(querier, gameId, prize),
          }
        default:
          return { invId: null, balance: null }
      }
    })
  }

  /**
   * Counts a finished adventure
   * @param gameId The player
   * @param defId The adventure
   * @param difficulty Normal 0 or hard 1
   * @returns How many times it was finished
   */
  public async complete(
    gameId: number,
    defId: number,
    difficulty: number,
  ): Promise<number> {
    await this.database.upsertOne(
      QuestCompletion,
      { gameId: true, defId: true, difficulty: true },
      { gameId, defId, difficulty, times: 1 },
      { times: { $inc: 1 }, lastAt: new Date() },
    )

    const row = await this.database.findOne(QuestCompletion, {
      $where: { gameId, defId, difficulty },
    })

    return row?.times ?? 1
  }

  /**
   * Lists the adventures a player finished
   * @param gameId The player
   * @returns The adventures
   */
  public async completions(gameId: number): Promise<QuestCompletion[]> {
    return this.database.findMany(QuestCompletion, {
      $where: { gameId },
      $sort: { defId: 'asc' },
    })
  }

  /**
   * Adds adventure experience to an animal
   * @param gameId The player
   * @param perUserAvId The animal
   * @param amount The experience
   * @returns The experience in all, or null
   */
  public async gainXp(
    gameId: number,
    perUserAvId: number,
    amount: number,
  ): Promise<number | null> {
    return this.database.transaction(async (querier) => {
      await querier.updateMany(
        Avatar,
        { $where: { gameId, perUserAvId } },
        { questXp: { $inc: amount } },
      )

      const avatar = await querier.findOne(Avatar, {
        $select: { questXp: true },
        $where: { gameId, perUserAvId },
      })

      return avatar?.questXp ?? null
    })
  }

  /**
   * Sets an animal's adventure level
   * @param gameId The player
   * @param perUserAvId The animal
   * @param questLevel The level
   */
  public async level(
    gameId: number,
    perUserAvId: number,
    questLevel: number,
  ): Promise<void> {
    await this.database.updateMany(
      Avatar,
      { $where: { gameId, perUserAvId } },
      { questLevel },
    )
  }

  /**
   * Reads an animal's adventure experience
   * @param gameId The player
   * @param perUserAvId The animal
   * @returns The experience
   */
  public async xpOf(gameId: number, perUserAvId: number): Promise<number> {
    const avatar = await this.database.findOne(Avatar, {
      $select: { questXp: true },
      $where: { gameId, perUserAvId },
    })

    return avatar?.questXp ?? 0
  }

  /**
   * Gives a clothing item
   * @param querier The querier
   * @param gameId The player
   * @param defId The item
   * @param color Its colour
   * @returns Its place in the inventory
   */
  private static async clothing(
    querier: Querier,
    gameId: number,
    defId: number,
    color: number,
  ): Promise<number> {
    const [last] = await querier.findMany(Item, {
      $select: { invId: true },
      $where: { gameId },
      $sort: { invId: 'desc' },
      $limit: 1,
    })
    const invId = (last?.invId ?? 0) + 1

    await querier.insertOne(Item, { gameId, invId, defId, color })
    return invId
  }

  /**
   * Gives a den item
   * @param querier The querier
   * @param gameId The player
   * @param defId The den item
   * @returns Its place in the inventory
   */
  private static async denItem(
    querier: Querier,
    gameId: number,
    defId: number,
  ): Promise<number> {
    const [last] = await querier.findMany(DenItem, {
      $select: { invIdx: true },
      $where: { gameId },
      $sort: { invIdx: 'desc' },
      $limit: 1,
    })
    const invIdx = (last?.invIdx ?? 0) + 1

    await querier.insertOne(DenItem, { gameId, invIdx, defId })
    return invIdx
  }

  /**
   * Pays gems or crystals
   * @param querier The querier
   * @param gameId The player
   * @param prize The prize
   * @returns The new balance
   */
  private static async pay(
    querier: Querier,
    gameId: number,
    prize: StoredPrize,
  ): Promise<number> {
    const field = prize.kind === GEMS ? 'gems' : 'orbs'
    await querier.updateOneById(Player, gameId, {
      [field]: { $inc: prize.value },
    })

    const player = await querier.findOneById(Player, gameId)
    return player?.[field] ?? 0
  }
}
