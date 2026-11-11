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
 * An achievement a player has earned
 * @class
 */
@Entity<Achievement>({
  name: 'achievements',
  indexes: [
    {
      name: 'achievements_once',
      unique: true,
      columns: (achievement) => [achievement.gameId, achievement.defId],
    },
  ],
  checks: [
    { name: 'achievements_inv_check', where: { invId: { $gt: 0 } } },
    { name: 'achievements_def_check', where: { defId: { $gt: 0 } } },
  ],
})
export class Achievement {
  /**
   * The key fields
   */
  declare public [idKey]?: 'gameId' | 'invId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'earnedAt'

  /**
   * The earner
   */
  @Id({
    type: Number,
    columnType: 'integer',
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public gameId!: number

  /**
   * Its place in the player's achievements
   */
  @Id({ type: Number, columnType: 'integer' })
  public invId!: number

  /**
   * The achievement's definition id
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public defId!: number

  /**
   * When it was earned
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public earnedAt!: Date

  /**
   * The earner
   */
  @ManyToOne({
    entity: () => Player,
    references: (achievement) => achievement.gameId,
  })
  public player?: Player
}
