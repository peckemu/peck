import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  ManyToOne,
} from 'uql-orm'

import { Player } from '#database/entities/player'

/**
 * A den room a player owns
 * @class
 */
@Entity<DenRoom>({
  name: 'den_rooms',
  checks: [{ name: 'den_rooms_inv_idx_check', where: { invIdx: { $gte: 0 } } }],
})
export class DenRoom {
  /**
   * The key fields
   */
  declare public [idKey]?: 'gameId' | 'invIdx'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'createdAt'

  /**
   * The owner
   */
  @Id({
    type: Number,
    columnType: 'integer',
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public gameId!: number

  /**
   * Its place in the player's den rooms
   */
  @Id({ type: Number, columnType: 'integer' })
  public invIdx!: number

  /**
   * The den room's definition id
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public defId!: number

  /**
   * When the player got it
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public createdAt!: Date

  /**
   * The owner
   */
  @ManyToOne({ entity: () => Player, references: (room) => room.gameId })
  public player?: Player
}
