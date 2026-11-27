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
 * A prize a player won in an adventure
 * @class
 */
@Entity<QuestPrize>({
  name: 'quest_prizes',
  checks: [
    {
      name: 'quest_prizes_color_check',
      where: { color: { $gte: 0, $lte: 4_294_967_295 } },
    },
  ],
})
export class QuestPrize {
  /**
   * The key field
   */
  declare public [idKey]?: 'id'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'id' | 'color' | 'wonAt'

  /**
   * The prize's id
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
   * The adventure
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public defId!: number

  /**
   * What it is
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public kind!: number

  /**
   * The item or the amount
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public value!: number

  /**
   * The clothing colour
   */
  @Field({
    type: Number,
    columnType: 'bigint',
    nullable: false,
    defaultValue: 0,
  })
  public color!: number

  /**
   * When it was won
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public wonAt!: Date
}
