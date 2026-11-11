import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  type Json,
  ManyToOne,
  sql,
  uuid,
} from 'uql-orm'

import { Player } from '#database/entities/player'

/**
 * The poster's animal
 */
export type PostAvatar = {
  /**
   * Its definition id
   */
  readonly ai: number

  /**
   * Its colours
   */
  readonly ac: number[]

  /**
   * Its eyes
   */
  readonly ae: number

  /**
   * Its pattern
   */
  readonly ap: number

  /**
   * Its custom animal, or -1
   */
  readonly aci: number
}

/**
 * A post on a Jammer Wall
 * @class
 */
@Entity<WallPost>({
  name: 'wall_posts',
  indexes: [
    {
      name: 'wall_posts_wall',
      columns: (post) => [post.wallGameId, post.postedAt],
    },
  ],
  checks: [
    {
      name: 'wall_posts_message_check',
      where: (post) => sql`char_length(${post.message}) <= 70`,
    },
  ],
})
export class WallPost {
  /**
   * The key field
   */
  declare public [idKey]?: 'id'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'id' | 'noticeRead' | 'postedAt'

  /**
   * Its id
   */
  @Id({ type: 'uuid', defaultValue: uuid })
  public id!: string

  /**
   * The wall's owner
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public wallGameId!: number

  /**
   * The poster
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public senderGameId!: number

  /**
   * The parent post, or null
   */
  @Field({ type: 'uuid', nullable: true })
  public parentId?: string | null

  /**
   * What it says
   */
  @Field({ type: 'text', nullable: false })
  public message!: string

  /**
   * The look behind the words
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public patternId!: number

  /**
   * The colour behind the words
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public colorId!: number

  /**
   * The poster's language
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public localizationId!: number

  /**
   * The poster's animal
   */
  @Field({ type: 'jsonb', nullable: false })
  public avatar!: Json<PostAvatar>

  /**
   * Whether the poster saw an answer
   */
  @Field({ type: Boolean, nullable: false, defaultValue: false })
  public noticeRead!: boolean

  /**
   * When it was posted
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public postedAt!: Date

  /**
   * The poster
   */
  @ManyToOne({ entity: () => Player, references: (post) => post.senderGameId })
  public sender?: Player
}
