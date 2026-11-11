import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  ManyToOne,
  uuid,
} from 'uql-orm'

import { Account } from '#database/entities/accounts/account'
import { Player } from '#database/entities/player'

/**
 * Every kind of sanction
 */
export const SANCTION_KINDS = ['ban', 'mute'] as const

/**
 * A kind of sanction
 */
export type SanctionKind = (typeof SANCTION_KINDS)[number]

/**
 * A ban or mute
 * @class
 */
@Entity<Sanction>({
  name: 'sanctions',
  indexes: [
    {
      name: 'sanctions_account',
      columns: (sanction) => [sanction.accountId, sanction.kind],
    },
  ],
})
export class Sanction {
  /**
   * The key field
   */
  declare public [idKey]?: 'id'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'id' | 'reasonId' | 'note' | 'createdAt'

  /**
   * Its id
   */
  @Id({ type: 'uuid', defaultValue: uuid })
  public id!: string

  /**
   * The account sanctioned
   */
  @Field({ references: () => Account, nullable: false, onDelete: 'CASCADE' })
  public accountId!: string

  /**
   * The player sanctioned
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
   * Its kind
   */
  @Field({ type: 'text', nullable: false, enum: SANCTION_KINDS })
  public kind!: SanctionKind

  /**
   * The rule broken
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public reasonId!: number

  /**
   * The staff note
   */
  @Field({ type: 'text', nullable: false, defaultValue: '' })
  public note!: string

  /**
   * The staff account giving it
   */
  @Field({ references: () => Account, nullable: true, onDelete: 'SET NULL' })
  public actorId?: string | null

  /**
   * When it was given
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public createdAt!: Date

  /**
   * When it ends, or null
   */
  @Field({ type: Date, nullable: true })
  public expiresAt?: Date | null

  /**
   * When staff lifted it
   */
  @Field({ type: Date, nullable: true })
  public liftedAt?: Date | null

  /**
   * The staff account lifting it
   */
  @Field({ references: () => Account, nullable: true, onDelete: 'SET NULL' })
  public liftedBy?: string | null

  /**
   * The player sanctioned
   */
  @ManyToOne({
    entity: () => Player,
    references: (sanction) => sanction.gameId,
  })
  public player?: Player
}
