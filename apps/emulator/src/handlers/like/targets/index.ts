import { inject, injectable } from '@needle-di/core'
import {
  type LikeType,
  MasterpieceRepository,
  WallRepository,
} from '@peck/database'

/**
 * Checks what can be liked
 * @class
 */
@injectable()
export class LikeTargets {
  /**
   * Keeps walls
   */
  private readonly walls = inject<WallRepository>(WallRepository)

  /**
   * Keeps masterpieces
   */
  private readonly masterpieces = inject<MasterpieceRepository>(
    MasterpieceRepository,
  )

  /**
   * Checks something can be liked
   * @param type Its type
   * @param id Which one
   * @returns Its type, or null
   */
  public async type(type: string, id: string): Promise<LikeType | null> {
    if (type === 'jammerwall') {
      return (await this.walls.ownerByUuid(id)) ? type : null
    }
    if (type !== 'masterpiece') return null

    return (await this.masterpieces.imageType(id, ['approved'])) === null
      ? null
      : type
  }
}
