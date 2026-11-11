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
 * A sent Jam-a-Gram
 * @class
 */
@Entity<Jamagram>({
  name: 'jamagrams',
  indexes: [
    { name: 'jamagrams_inbox', columns: (card) => [card.toGameId, card.id] },
  ],
  checks: [
    {
      name: 'jamagrams_message_check',
      where: (card) => sql`char_length(${card.message}) <= 500`,
    },
    {
      name: 'jamagrams_gift_color_check',
      where: { giftColor: { $gte: 0, $lte: 4_294_967_295 } },
    },
  ],
})
export class Jamagram {
  /**
   * The key field
   */
  declare public [idKey]?: 'id'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?:
    | 'id'
    | 'stampMediaId'
    | 'giftId'
    | 'giftColor'
    | 'giftName'
    | 'giftVersion'
    | 'specialType'
    | 'senderType'
    | 'read'
    | 'sentAt'

  /**
   * The card's id
   */
  @Id({ type: Number, columnType: 'bigint', autoIncrement: true })
  public id!: number

  /**
   * The recipient
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public toGameId!: number

  /**
   * The sender, or null
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: true,
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public fromGameId?: number | null

  /**
   * 0 a player, 1 AJHQ
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public senderType!: number

  /**
   * The card's picture
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public cardMediaId!: number

  /**
   * The stamp's picture
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public stampMediaId!: number

  /**
   * What it says
   */
  @Field({ type: 'text', nullable: false })
  public message!: string

  /**
   * 1 safe chat, 2 typed
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public messageType!: number

  /**
   * 0 plain, 1 clothing, 3 den item
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public type!: number

  /**
   * The gift's definition id, or 0
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public giftId!: number

  /**
   * The gift's colour
   */
  @Field({
    type: Number,
    columnType: 'bigint',
    nullable: false,
    defaultValue: 0,
  })
  public giftColor!: number

  /**
   * The gift's name string id
   */
  @Field({ type: 'text', nullable: false, defaultValue: '' })
  public giftName!: string

  /**
   * Which of a den item's looks
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public giftVersion!: number

  /**
   * Whether the gift was kept
   */
  @Field({ type: Boolean, nullable: true })
  public giftKept?: boolean | null

  /**
   * 0 normal, 1 valentine
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public specialType!: number

  /**
   * Whether it was read
   */
  @Field({ type: Boolean, nullable: false, defaultValue: false })
  public read!: boolean

  /**
   * When it was sent
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public sentAt!: Date

  /**
   * When it was deleted
   */
  @Field({ type: Date, nullable: true })
  public deletedAt?: Date | null

  /**
   * The sender
   */
  @ManyToOne({ entity: () => Player, references: (card) => card.fromGameId })
  public sender?: Player
}
