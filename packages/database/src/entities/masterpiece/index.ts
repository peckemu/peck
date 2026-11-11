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
 * A masterpiece's status
 */
export const MASTERPIECE_STATUSES = [
  'uploaded',
  'discarded',
  'pending',
  'approved',
  'rejected',
] as const

/**
 * A masterpiece's status
 */
export type MasterpieceStatus = (typeof MASTERPIECE_STATUSES)[number]

/**
 * A picture painted in the art studio
 * @class
 */
@Entity<Masterpiece>({
  name: 'masterpieces',
  indexes: [
    {
      name: 'masterpieces_creator',
      columns: (art) => [art.creatorGameId, art.createdAt],
    },
    {
      name: 'masterpieces_status',
      columns: (art) => [art.status, art.createdAt],
    },
  ],
})
export class Masterpiece {
  /**
   * The key field
   */
  declare public [idKey]?: 'uniqueImageId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?:
    'status' | 'diamondsPaid' | 'tokenPaid' | 'createdAt'

  /**
   * Its id
   */
  @Id({ type: 'text' })
  public uniqueImageId!: string

  /**
   * The painter
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public creatorGameId!: number

  /**
   * Its status
   */
  @Field({
    type: 'text',
    nullable: false,
    enum: MASTERPIECE_STATUSES,
    defaultValue: 'uploaded',
  })
  public status!: MasterpieceStatus

  /**
   * The picture's type
   */
  @Field({ type: 'text', nullable: false })
  public imageType!: string

  /**
   * The frame's diamond price
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public diamondsPaid!: number

  /**
   * Whether a token paid for its frame
   */
  @Field({ type: Boolean, nullable: false, defaultValue: false })
  public tokenPaid!: boolean

  /**
   * When it was uploaded
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public createdAt!: Date

  /**
   * When staff decided it
   */
  @Field({ type: Date, nullable: true })
  public decidedAt?: Date | null

  /**
   * The painter
   */
  @ManyToOne({ entity: () => Player, references: (art) => art.creatorGameId })
  public creator?: Player
}
