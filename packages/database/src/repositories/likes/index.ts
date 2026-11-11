import { Like, type LikeType } from '#database/entities/like'
import { type Database } from '#database/pool'

/**
 * Keeps likes on walls and masterpieces
 * @class
 */
export class LikeRepository {
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
   * Counts the likes on something
   * @param type Its type
   * @param id Which one
   * @param gameId The player asking
   * @returns The count and their like
   */
  public async of(
    type: LikeType,
    id: string,
    gameId: number,
  ): Promise<{ readonly count: number; readonly liked: boolean }> {
    const [count, liked] = await Promise.all([
      this.database.count(Like, {
        $where: { resourceType: type, resourceId: id },
      }),
      this.database.exists(Like, {
        $where: { resourceType: type, resourceId: id, likerGameId: gameId },
      }),
    ])

    return { count, liked }
  }

  /**
   * Likes something
   * @param type Its type
   * @param id Which one
   * @param gameId The player
   * @returns Whether it is new
   */
  public async like(
    type: LikeType,
    id: string,
    gameId: number,
  ): Promise<boolean> {
    const liked = await this.database.exists(Like, {
      $where: { resourceType: type, resourceId: id, likerGameId: gameId },
    })
    if (liked) return false

    await this.database.insertOne(Like, {
      resourceType: type,
      resourceId: id,
      likerGameId: gameId,
    })

    return true
  }
}
