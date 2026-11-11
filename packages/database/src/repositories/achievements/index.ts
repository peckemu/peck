import { Achievement } from '#database/entities/achievement'
import { Player } from '#database/entities/player'
import { type Database } from '#database/pool'

/**
 * An achievement a player holds
 */
export type HeldAchievement = {
  /**
   * Its place in the player's achievements
   */
  readonly invId: number

  /**
   * Its definition id
   */
  readonly defId: number
}

/**
 * Keeps players' achievements
 * @class
 */
export class AchievementRepository {
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
   * Lists a player's achievements
   * @param username The player's username
   * @returns The achievements, or null
   */
  public async of(username: string): Promise<HeldAchievement[] | null> {
    const player = await this.database.findOne(Player, {
      $select: { gameId: true },
      $where: { username: { $ilike: AchievementRepository.exact(username) } },
    })
    if (!player) return null

    const achievements = await this.database.findMany(Achievement, {
      $select: { invId: true, defId: true },
      $where: { gameId: player.gameId },
      $sort: { invId: 'asc' },
    })

    return achievements.map(({ invId, defId }) => ({ invId, defId }))
  }

  /**
   * Gives a player achievements
   * @param gameId The player
   * @param defIds The achievement ids
   * @returns The achievements given
   */
  public async award(
    gameId: number,
    defIds: readonly number[],
  ): Promise<HeldAchievement[]> {
    if (defIds.length === 0) return []

    return this.database.transaction(async (querier) => {
      await querier.all`SELECT game_id FROM players WHERE game_id = ${gameId} FOR UPDATE`

      const held = await querier.findMany(Achievement, {
        $select: { invId: true, defId: true },
        $where: { gameId },
      })
      const had = new Set(held.map(({ defId }) => defId))
      const last = held.reduce((most, each) => Math.max(most, each.invId), 0)

      const given = [...new Set(defIds)]
        .filter((defId) => !had.has(defId))
        .map((defId, index) => ({ invId: last + index + 1, defId }))

      if (given.length > 0) {
        await querier.insertMany(
          Achievement,
          given.map(({ invId, defId }) => ({ gameId, invId, defId })),
        )
      }

      return given
    })
  }

  /**
   * Escapes a username
   * @param username The username
   * @returns The pattern
   */
  private static exact(username: string): string {
    return username.replace(/[\\%_]/g, '\\$&')
  }
}
