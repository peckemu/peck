import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  type Json,
} from 'uql-orm'

import { Player } from '#database/entities/player'

/**
 * A sticker on a wall
 */
export type WallSticker = {
  /**
   * Its media id
   */
  readonly id: number

  /**
   * Its place
   */
  readonly pos: number
}

/**
 * A masterpiece on a wall
 */
export type WallFrame = {
  /**
   * The den item holding it
   */
  readonly iid: number

  /**
   * Its frame
   */
  readonly sid: number
}

/**
 * How a player's Jammer Wall looks
 * @class
 */
@Entity<Wall>({ name: 'walls' })
export class Wall {
  /**
   * The key field
   */
  declare public [idKey]?: 'gameId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?:
    | 'background'
    | 'status'
    | 'langId'
    | 'stickers'
    | 'masterpieces'
    | 'visits'
    | 'readAt'
    | 'changedAt'

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
   * Its background
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 19,
  })
  public background!: number

  /**
   * Its status line
   */
  @Field({ type: 'text', nullable: false, defaultValue: '' })
  public status!: string

  /**
   * The status line's language
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public langId!: number

  /**
   * Its stickers
   */
  @Field({ type: 'jsonb', nullable: false, defaultValue: [] })
  public stickers!: Json<WallSticker[]>

  /**
   * Its masterpieces
   */
  @Field({ type: 'jsonb', nullable: false, defaultValue: [] })
  public masterpieces!: Json<WallFrame[]>

  /**
   * Its photo booth picture
   */
  @Field({ type: 'jsonb', nullable: true })
  public photo?: Json<Record<string, unknown>> | null

  /**
   * How many have visited
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public visits!: number

  /**
   * When its owner last read it
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public readAt!: Date

  /**
   * When it last changed
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public changedAt!: Date
}
