import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  ManyToOne,
  sql,
} from 'uql-orm'

import { Player } from '#database/entities/player'

/**
 * Where a prize came from
 */
export const PRIZE_SOURCES = ['eco-gift'] as const

/**
 * Where a prize came from
 */
export type PrizeSource = (typeof PRIZE_SOURCES)[number]

/**
 * A prize offered to a player
 * @class
 */
@Entity<ItemPrize>({
  name: 'item_prizes',
  indexes: [
    {
      name: 'item_prizes_waiting',
      unique: true,
      columns: (prize) => [prize.gameId, prize.userVarId],
      where: { answeredAt: null },
    },
  ],
  checks: [
    { name: 'item_prizes_user_var_id_check', where: { userVarId: { $gt: 0 } } },
    {
      name: 'item_prizes_den_item_def_id_check',
      where: { denItemDefId: { $gt: 0 } },
    },
    {
      name: 'item_prizes_color_check',
      where: { color: { $gte: 0, $lte: 255 } },
    },
    {
      name: 'item_prizes_answered_check',
      where: (prize) =>
        sql`(${prize.answeredAt} IS NULL) = (${prize.kept} IS NULL)`,
    },
  ],
})
export class ItemPrize {
  /**
   * The key field
   */
  declare public [idKey]?: 'id'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?:
    'id' | 'color' | 'nameStrId' | 'descStrId' | 'sourceRef' | 'offeredAt'

  /**
   * The prize's id
   */
  @Id({ type: Number, columnType: 'bigint', autoIncrement: true })
  public id!: number

  /**
   * The offered player
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
   * The user variable it sets
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public userVarId!: number

  /**
   * The den item's definition id
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public denItemDefId!: number

  /**
   * The den item's colour
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public color!: number

  /**
   * The prize's name string id
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public nameStrId!: number

  /**
   * The prize's description string id
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public descStrId!: number

  /**
   * Where it came from
   */
  @Field({ type: 'text', nullable: false, enum: PRIZE_SOURCES })
  public source!: PrizeSource

  /**
   * The source id, or 0
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public sourceRef!: number

  /**
   * When it was offered
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public offeredAt!: Date

  /**
   * When the player answered
   */
  @Field({ type: Date, nullable: true })
  public answeredAt?: Date | null

  /**
   * Whether the player kept it
   */
  @Field({ type: Boolean, nullable: true })
  public kept?: boolean | null

  /**
   * The offered player
   */
  @ManyToOne({ entity: () => Player, references: (prize) => prize.gameId })
  public player?: Player
}
