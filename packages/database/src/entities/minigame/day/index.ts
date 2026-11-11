import { Entity, Field, type filledKey, Id, type idKey } from 'uql-orm'

import { Player } from '#database/entities/player'

/**
 * A player's daily game stats
 * @class
 */
@Entity<MinigameDay>({
  name: 'minigame_days',
  checks: [
    { name: 'minigame_days_plays_check', where: { plays: { $gte: 0 } } },
    { name: 'minigame_days_gems_check', where: { gems: { $gte: 0 } } },
  ],
})
export class MinigameDay {
  /**
   * The key fields
   */
  declare public [idKey]?: 'gameId' | 'day' | 'gameDefId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'plays' | 'gems' | 'mastery'

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
   * The UTC day
   */
  @Id({ type: 'text' })
  public day!: string

  /**
   * The game
   */
  @Id({ type: Number, columnType: 'integer' })
  public gameDefId!: number

  /**
   * How many times they played
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public plays!: number

  /**
   * The gems they won
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public gems!: number

  /**
   * The mastery points their pet won
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public mastery!: number
}
