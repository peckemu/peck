import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
} from 'uql-orm'

import { Player } from '../../player/index.ts'

/**
 * How often a player finished an adventure
 * @class
 */
@Entity<QuestCompletion>({
  name: 'quest_completions',
  checks: [
    { name: 'quest_completions_times_check', where: { times: { $gte: 0 } } },
  ],
})
export class QuestCompletion {
  /**
   * The key fields
   */
  declare public [idKey]?: 'gameId' | 'defId' | 'difficulty'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'times' | 'firstAt' | 'lastAt'

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
   * The adventure
   */
  @Id({ type: Number, columnType: 'integer' })
  public defId!: number

  /**
   * Normal 0 or hard 1
   */
  @Id({ type: Number, columnType: 'smallint' })
  public difficulty!: number

  /**
   * How many times
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public times!: number

  /**
   * When it was first finished
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public firstAt!: Date

  /**
   * When it was last finished
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public lastAt!: Date
}
