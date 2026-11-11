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
 * One side of a buddyship
 * @class
 */
@Entity<Buddy>({
  name: 'buddies',
  indexes: [{ name: 'buddies_buddy', columns: (row) => [row.buddyGameId] }],
  checks: [
    {
      name: 'buddies_self_check',
      where: (row) => sql`${row.gameId} <> ${row.buddyGameId}`,
    },
  ],
})
export class Buddy {
  /**
   * The key fields
   */
  declare public [idKey]?: 'gameId' | 'buddyGameId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'createdAt'

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
   * Their buddy
   */
  @Id({
    type: Number,
    columnType: 'integer',
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public buddyGameId!: number

  /**
   * When it was made
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public createdAt!: Date

  /**
   * Their buddy
   */
  @ManyToOne({ entity: () => Player, references: (row) => row.buddyGameId })
  public other?: Player
}
