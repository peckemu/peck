import { Entity, Id, type idKey } from 'uql-orm'

import { Player } from '#database/entities/player'

/**
 * A wall post a player hid
 * @class
 */
@Entity<WallHidden>({ name: 'wall_hidden' })
export class WallHidden {
  /**
   * The key fields
   */
  declare public [idKey]?: 'gameId' | 'postId'

  /**
   * The player
   */
  @Id({
    type: Number,
    columnType: 'integer',
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public gameId!: number

  /**
   * The post
   */
  @Id({ type: 'uuid' })
  public postId!: string
}
