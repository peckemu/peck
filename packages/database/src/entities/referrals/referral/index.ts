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

import { Player } from '../../player/index.ts'

/**
 * A player naming who referred them
 * @class
 */
@Entity<Referral>({
  name: 'referrals',
  indexes: [
    { name: 'referrals_referrer', columns: (row) => [row.referrerGameId] },
  ],
  checks: [
    {
      name: 'referrals_self_check',
      where: (row) => sql`${row.gameId} <> ${row.referrerGameId}`,
    },
  ],
})
export class Referral {
  /**
   * The key fields
   */
  declare public [idKey]?: 'gameId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'createdAt'

  /**
   * The player referred
   */
  @Id({
    type: Number,
    columnType: 'integer',
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public gameId!: number

  /**
   * The player who referred them
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public referrerGameId!: number

  /**
   * When it was named
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public createdAt!: Date

  /**
   * The player referred
   */
  @ManyToOne({ entity: () => Player, references: (row) => row.gameId })
  public player?: Player
}
