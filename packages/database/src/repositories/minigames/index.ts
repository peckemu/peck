import { MinigameDefinition } from '#database/entities/definitions/minigame'
import { MinigameDay } from '#database/entities/minigame/day'
import { MinigameScore } from '#database/entities/minigame/score'
import { Player } from '#database/entities/player'
import { type Database, type Querier } from '#database/pool'

/**
 * How many players a board shows
 */
const BOARD_SIZE = 10

/**
 * A player on a board
 */
export type BoardEntry = {
  /**
   * Their username
   */
  readonly username: string

  /**
   * Their best score
   */
  readonly score: number
}

/**
 * One leaderboard
 */
export type Board = {
  /**
   * The player's own best, or -1
   */
  readonly own: number

  /**
   * The best players
   */
  readonly top: readonly BoardEntry[]
}

/**
 * The leaderboards for one game
 */
export type Boards = {
  /**
   * Of all time
   */
  readonly allTime: Board

  /**
   * Since Monday
   */
  readonly thisWeek: Board

  /**
   * Among the player's buddies
   */
  readonly buddies: Board
}

/**
 * What a gem award came to
 */
export type GemAward = {
  /**
   * The gems given
   */
  readonly granted: number

  /**
   * The gems afterwards
   */
  readonly gems: number
}

/**
 * Minigame stats
 * @class
 */
export class MinigameRepository {
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
   * Lists every minigame
   * @returns The minigames
   */
  public async definitions(): Promise<MinigameDefinition[]> {
    return this.database.findMany(MinigameDefinition, {
      $sort: { defId: 'asc' },
    })
  }

  /**
   * Counts a play
   * @param gameId The player
   * @param gameDefId The game
   */
  public async play(gameId: number, gameDefId: number): Promise<void> {
    await this.database.transaction(async (querier) => {
      await MinigameRepository.raise(querier, gameId, gameDefId, { plays: 1 })
    })
  }

  /**
   * Gives gems won in a game
   * @param gameId The player
   * @param gameDefId The game
   * @param amount The gems won
   * @param dailyLimit The most gems a day
   * @returns The gift
   */
  public async gems(
    gameId: number,
    gameDefId: number,
    amount: number,
    dailyLimit: number,
  ): Promise<GemAward> {
    return this.database.transaction(async (querier) => {
      await querier.all`SELECT game_id FROM players WHERE game_id = ${gameId} FOR UPDATE`

      const today = await querier.findMany(MinigameDay, {
        $where: { gameId, day: MinigameRepository.today() },
      })
      const won = today.reduce((sum, { gems }) => sum + gems, 0)
      const granted = Math.max(0, Math.min(amount, dailyLimit - won))

      if (granted > 0) {
        await querier.updateOneById(Player, gameId, { gems: { $inc: granted } })
        await MinigameRepository.raise(querier, gameId, gameDefId, {
          gems: granted,
        })
      }

      const gems = (await querier.findOneById(Player, gameId))?.gems ?? 0

      return { granted, gems }
    })
  }

  /**
   * Counts mastery points a pet won
   * @param gameId The player
   * @param gameDefId The game
   * @param points The points
   */
  public async mastery(
    gameId: number,
    gameDefId: number,
    points: number,
  ): Promise<void> {
    await this.database.transaction(async (querier) => {
      await MinigameRepository.raise(querier, gameId, gameDefId, {
        mastery: points,
      })
    })
  }

  /**
   * Keeps a score
   * @param gameId The player
   * @param gameDefId The game
   * @param score The score
   * @returns The player's best
   */
  public async score(
    gameId: number,
    gameDefId: number,
    score: number,
  ): Promise<number> {
    await this.database.insertOne(MinigameScore, { gameId, gameDefId, score })

    const [best] = await this.database.findMany(MinigameScore, {
      $select: { score: true },
      $where: { gameId, gameDefId },
      $sort: { score: 'desc' },
      $limit: 1,
    })

    return best?.score ?? score
  }

  /**
   * Reads a game's leaderboards
   * @param gameId The player asking
   * @param gameDefId The game
   * @param buddyIds The player's buddies
   * @returns The boards
   */
  public async boards(
    gameId: number,
    gameDefId: number,
    buddyIds: readonly number[],
  ): Promise<Boards> {
    const monday = MinigameRepository.monday()

    return {
      allTime: await this.board(gameId, gameDefId, null, null),
      thisWeek: await this.board(gameId, gameDefId, monday, null),
      buddies: await this.board(gameId, gameDefId, null, [gameId, ...buddyIds]),
    }
  }

  /**
   * Reads one leaderboard
   * @param gameId The player asking
   * @param gameDefId The game
   * @param since The earliest time, or null
   * @param among The players to check, or null
   * @returns The board
   */
  private async board(
    gameId: number,
    gameDefId: number,
    since: Date | null,
    among: readonly number[] | null,
  ): Promise<Board> {
    const rows = await this.database.findMany(MinigameScore, {
      $where: {
        gameDefId,
        ...(since ? { at: { $gte: since } } : {}),
        ...(among ? { gameId: { $in: [...among] } } : {}),
      },
    })

    const best = new Map<number, { score: number; at: number }>()
    for (const row of rows) {
      const kept = best.get(row.gameId)
      if (!kept || row.score > kept.score) {
        best.set(row.gameId, { score: row.score, at: row.at.getTime() })
      }
    }

    const ranked = [...best]
      .sort(([, a], [, b]) => b.score - a.score || a.at - b.at)
      .slice(0, BOARD_SIZE)
    const players = await this.database.findMany(Player, {
      $select: { gameId: true, username: true },
      $where: { gameId: { $in: ranked.map(([id]) => id) } },
    })
    const names = new Map(
      players.map((player) => [player.gameId, player.username]),
    )

    return {
      own: best.get(gameId)?.score ?? -1,
      top: ranked.map(([id, { score }]) => ({
        username: names.get(id) ?? '',
        score,
      })),
    }
  }

  /**
   * Adds to a player's day in one game
   * @param querier The querier
   * @param gameId The player
   * @param gameDefId The game
   * @param by What to add
   * @param by.plays Plays
   * @param by.gems Gems
   * @param by.mastery Mastery points
   */
  private static async raise(
    querier: Querier,
    gameId: number,
    gameDefId: number,
    by: {
      readonly plays?: number
      readonly gems?: number
      readonly mastery?: number
    },
  ): Promise<void> {
    const day = MinigameRepository.today()

    await querier.upsertOne(
      MinigameDay,
      { gameId: true, day: true, gameDefId: true },
      {
        gameId,
        day,
        gameDefId,
        plays: by.plays ?? 0,
        gems: by.gems ?? 0,
        mastery: by.mastery ?? 0,
      },
      {
        plays: { $inc: by.plays ?? 0 },
        gems: { $inc: by.gems ?? 0 },
        mastery: { $inc: by.mastery ?? 0 },
      },
    )
  }

  /**
   * Names today, in UTC
   * @returns The day
   */
  private static today(): string {
    return new Date().toISOString().slice(0, 10)
  }

  /**
   * Finds the start of the week
   * @returns Monday at midnight
   */
  private static monday(): Date {
    const now = new Date()
    const back = (now.getUTCDay() + 6) % 7

    return new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - back,
      ),
    )
  }
}
