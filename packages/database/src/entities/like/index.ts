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
 * What can be liked
 */
export const LIKE_TYPES = ['masterpiece', 'jammerwall'] as const

/**
 * What can be liked
 */
export type LikeType = (typeof LIKE_TYPES)[number]

/**
 * A player's like
 * @class
 */
@Entity<Like>({
  name: 'likes',
  checks: [
    {
      name: 'likes_resource_id_check',
      where: (like) => sql`length(${like.resourceId}) <= 100`,
    },
  ],
})
export class Like {
  /**
   * The key fields
   */
  declare public [idKey]?: 'resourceType' | 'resourceId' | 'likerGameId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'at'

  /**
   * What was liked
   */
  @Id({ type: 'text', enum: LIKE_TYPES })
  public resourceType!: LikeType

  /**
   * The liked id
   */
  @Id({ type: 'text' })
  public resourceId!: string

  /**
   * The liker
   */
  @Id({
    type: Number,
    columnType: 'integer',
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public likerGameId!: number

  /**
   * When it was liked
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public at!: Date

  /**
   * The liker
   */
  @ManyToOne({ entity: () => Player, references: (like) => like.likerGameId })
  public liker?: Player
}
