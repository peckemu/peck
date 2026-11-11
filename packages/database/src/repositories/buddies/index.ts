import { Block } from '#database/entities/buddies/block'
import { Buddy } from '#database/entities/buddies/buddy'
import { BuddyRequest } from '#database/entities/buddies/request'
import { UserVariable } from '#database/entities/variable'
import { type Database, type Querier } from '#database/pool'

/**
 * The settings user variable
 */
const SETTINGS = 363

/**
 * The buddy request settings bit
 */
const NO_REQUESTS = 1

/**
 * The buddy request lifetime
 */
const REQUEST_LIFE = 10 * 60 * 1000

/**
 * A buddy, or a player blocked
 */
export type BuddyEntry = {
  /**
   * Their id in the database
   */
  readonly gameId: number

  /**
   * Their username
   */
  readonly username: string

  /**
   * Their uuid
   */
  readonly uuid: string

  /**
   * Their account type
   */
  readonly accountType: number
}

/**
 * What a buddy request came to
 */
export type RequestOutcome =
  | 'not-taking'
  | 'unblock-first'
  | 'already'
  | 'my-list-full'
  | 'their-list-full'
  | 'became'
  | 'sent'

/**
 * What answering a buddy request came to
 */
export type AnswerOutcome =
  'none' | 'declined' | 'my-list-full' | 'their-list-full' | 'became'

/**
 * Reads and changes buddies and blocks
 * @class
 */
export class BuddyRepository {
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
   * Lists a player's buddies
   * @param gameId The player
   * @returns Their buddies
   */
  public async of(gameId: number): Promise<BuddyEntry[]> {
    const rows = await this.database.findMany(Buddy, {
      $where: { gameId },
      $populate: { other: true },
      $sort: { buddyGameId: 'asc' },
    })

    return rows.flatMap(({ other }) =>
      other ? [BuddyRepository.entry(other)] : [],
    )
  }

  /**
   * Lists the players a player blocks
   * @param gameId The player
   * @returns The players blocked
   */
  public async blocking(gameId: number): Promise<BuddyEntry[]> {
    const rows = await this.database.findMany(Block, {
      $where: { blockerGameId: gameId },
      $populate: { other: true },
    })

    return rows.flatMap(({ other }) =>
      other ? [BuddyRepository.entry(other)] : [],
    )
  }

  /**
   * Lists a player's blockers
   * @param gameId The player
   * @returns Their ids
   */
  public async blockedBy(gameId: number): Promise<number[]> {
    const rows = await this.database.findMany(Block, {
      $where: { blockedGameId: gameId },
    })

    return rows.map(({ blockerGameId }) => blockerGameId)
  }

  /**
   * Checks a player takes buddy requests
   * @param gameId The player
   * @returns Whether they do
   */
  public async takesRequests(gameId: number): Promise<boolean> {
    const settings = await this.database.findOne(UserVariable, {
      $where: { gameId, varId: SETTINGS },
    })

    return ((settings?.value ?? 0) & NO_REQUESTS) === 0
  }

  /**
   * Asks a player to be a buddy
   * @param askerId The player asking
   * @param targetId The player asked
   * @param askerMost The most buddies the asker can have
   * @param targetMost The most buddies the target can have
   * @returns What it came to
   */
  public async request(
    askerId: number,
    targetId: number,
    askerMost: number,
    targetMost: number,
  ): Promise<RequestOutcome> {
    if (askerId === targetId) return 'not-taking'

    return this.database.transaction(async (querier) => {
      await BuddyRepository.lock(querier, askerId, targetId)

      if (await BuddyRepository.blocks(querier, askerId, targetId)) {
        return 'unblock-first'
      }
      if (await BuddyRepository.blocks(querier, targetId, askerId)) {
        return 'not-taking'
      }
      if (
        await querier.exists(Buddy, {
          $where: { gameId: askerId, buddyGameId: targetId },
        })
      ) {
        return 'already'
      }

      if ((await BuddyRepository.count(querier, askerId)) >= askerMost) {
        return 'my-list-full'
      }
      if ((await BuddyRepository.count(querier, targetId)) >= targetMost) {
        return 'their-list-full'
      }

      const asked = await querier.deleteMany(BuddyRequest, {
        $where: { fromGameId: targetId, toGameId: askerId },
      })
      if (asked > 0) {
        await BuddyRepository.befriend(querier, askerId, targetId)
        return 'became'
      }

      await querier.upsertOne(
        BuddyRequest,
        { fromGameId: true, toGameId: true },
        { fromGameId: askerId, toGameId: targetId, createdAt: new Date() },
      )

      return 'sent'
    })
  }

  /**
   * Answers a buddy request
   * @param answererId The player answering
   * @param askerId The asker
   * @param accept Whether they said yes
   * @param answererMost The most buddies the answerer can have
   * @param askerMost The most buddies the asker can have
   * @returns What it came to
   */
  public async answer(
    answererId: number,
    askerId: number,
    accept: boolean,
    answererMost: number,
    askerMost: number,
  ): Promise<AnswerOutcome> {
    if (answererId === askerId) return 'none'

    return this.database.transaction(async (querier) => {
      await BuddyRepository.lock(querier, answererId, askerId)

      const request = await querier.findOne(BuddyRequest, {
        $where: { fromGameId: askerId, toGameId: answererId },
      })
      if (!request) return 'none'

      await querier.deleteMany(BuddyRequest, {
        $where: { fromGameId: askerId, toGameId: answererId },
      })

      if (request.createdAt.getTime() < Date.now() - REQUEST_LIFE) return 'none'
      if (!accept) return 'declined'

      if ((await BuddyRepository.count(querier, answererId)) >= answererMost) {
        return 'my-list-full'
      }
      if ((await BuddyRepository.count(querier, askerId)) >= askerMost) {
        return 'their-list-full'
      }

      await BuddyRepository.befriend(querier, answererId, askerId)

      return 'became'
    })
  }

  /**
   * Ends a buddyship
   * @param gameId One player
   * @param buddyGameId The other
   * @returns Whether they were buddies
   */
  public async remove(gameId: number, buddyGameId: number): Promise<boolean> {
    return this.database.transaction(async (querier) => {
      const removed = await BuddyRepository.unfriend(
        querier,
        gameId,
        buddyGameId,
      )

      return removed > 0
    })
  }

  /**
   * Blocks a player
   * @param blockerId The player blocking
   * @param blockedId The player blocked
   * @returns Whether they were buddies
   */
  public async block(blockerId: number, blockedId: number): Promise<boolean> {
    return this.database.transaction(async (querier) => {
      await querier.upsertOne(
        Block,
        { blockerGameId: true, blockedGameId: true },
        { blockerGameId: blockerId, blockedGameId: blockedId },
      )

      const removed = await BuddyRepository.unfriend(
        querier,
        blockerId,
        blockedId,
      )
      await querier.deleteMany(BuddyRequest, {
        $where: {
          fromGameId: { $in: [blockerId, blockedId] },
          toGameId: { $in: [blockerId, blockedId] },
        },
      })

      return removed > 0
    })
  }

  /**
   * Unblocks a player
   * @param blockerId The player blocking
   * @param blockedId The player blocked
   * @returns Whether they were blocked
   */
  public async unblock(blockerId: number, blockedId: number): Promise<boolean> {
    const removed = await this.database.deleteMany(Block, {
      $where: { blockerGameId: blockerId, blockedGameId: blockedId },
    })

    return removed > 0
  }

  /**
   * Checks two players are buddies
   * @param gameId One player
   * @param buddyGameId The other
   * @returns Whether they are
   */
  public async areBuddies(
    gameId: number,
    buddyGameId: number,
  ): Promise<boolean> {
    return this.database.exists(Buddy, { $where: { gameId, buddyGameId } })
  }

  /**
   * Locks two players' rows
   * @param querier The querier
   * @param one One player
   * @param other The other
   */
  private static async lock(
    querier: Querier,
    one: number,
    other: number,
  ): Promise<void> {
    const [first, second] = one < other ? [one, other] : [other, one]

    await querier.all`SELECT game_id FROM players WHERE game_id IN (${first}, ${second}) ORDER BY game_id FOR UPDATE`
  }

  /**
   * Checks one player blocks another
   * @param querier The querier
   * @param blockerId The player blocking
   * @param blockedId The player blocked
   * @returns Whether they do
   */
  private static async blocks(
    querier: Querier,
    blockerId: number,
    blockedId: number,
  ): Promise<boolean> {
    return querier.exists(Block, {
      $where: { blockerGameId: blockerId, blockedGameId: blockedId },
    })
  }

  /**
   * Counts a player's buddies
   * @param querier The querier
   * @param gameId The player
   * @returns How many
   */
  private static async count(
    querier: Querier,
    gameId: number,
  ): Promise<number> {
    return querier.count(Buddy, { $where: { gameId } })
  }

  /**
   * Makes two players buddies both ways
   * @param querier The querier
   * @param one One player
   * @param other The other
   */
  private static async befriend(
    querier: Querier,
    one: number,
    other: number,
  ): Promise<void> {
    await querier.insertMany(Buddy, [
      { gameId: one, buddyGameId: other },
      { gameId: other, buddyGameId: one },
    ])
    await querier.deleteMany(BuddyRequest, {
      $where: {
        fromGameId: { $in: [one, other] },
        toGameId: { $in: [one, other] },
      },
    })
  }

  /**
   * Ends a buddyship both ways
   * @param querier The querier
   * @param one One player
   * @param other The other
   * @returns How many rows went
   */
  private static async unfriend(
    querier: Querier,
    one: number,
    other: number,
  ): Promise<number> {
    return querier.deleteMany(Buddy, {
      $where: {
        gameId: { $in: [one, other] },
        buddyGameId: { $in: [one, other] },
      },
    })
  }

  /**
   * Describes a player
   * @param player The player
   * @param player.gameId Their id
   * @param player.username Their username
   * @param player.uuid Their uuid
   * @param player.accountType Their account type
   * @returns The entry
   */
  private static entry(player: {
    readonly gameId: number
    readonly username: string
    readonly uuid: string
    readonly accountType: number
  }): BuddyEntry {
    return {
      gameId: player.gameId,
      username: player.username,
      uuid: player.uuid,
      accountType: player.accountType,
    }
  }
}
