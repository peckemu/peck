import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
} from 'uql-orm'

import { Player } from '#database/entities/player'

/**
 * A score a player got
 * @class
 */
@Entity<MinigameScore>({
  name: 'minigame_scores',
  indexes: [
    {
      name: 'minigame_scores_board',
      columns: (row) => [row.gameDefId, row.score],
    },
  ],
  checks: [
    {
      name: 'minigame_scores_score_check',
      where: { score: { $gte: 0, $lte: 9_999_999 } },
    },
  ],
})
export class MinigameScore {
  /**
   * The key field
   */
  declare public [idKey]?: 'id'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'id' | 'at'

  /**
   * The score's id
   */
  @Id({ type: Number, columnType: 'bigint', autoIncrement: true })
  public id!: number

  /**
   * The player
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public gameId!: number

  /**
   * The game
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public gameDefId!: number

  /**
   * The score
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public score!: number

  /**
   * When they got it
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public at!: Date
}
