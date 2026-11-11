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
 * A pending buddy request
 * @class
 */
@Entity<BuddyRequest>({
  name: 'buddy_requests',
  indexes: [{ name: 'buddy_requests_to', columns: (row) => [row.toGameId] }],
  checks: [
    {
      name: 'buddy_requests_self_check',
      where: (row) => sql`${row.fromGameId} <> ${row.toGameId}`,
    },
  ],
})
export class BuddyRequest {
  /**
   * The key fields
   */
  declare public [idKey]?: 'fromGameId' | 'toGameId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'createdAt'

  /**
   * The player asking
   */
  @Id({
    type: Number,
    columnType: 'integer',
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public fromGameId!: number

  /**
   * The player asked
   */
  @Id({
    type: Number,
    columnType: 'integer',
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public toGameId!: number

  /**
   * When it was made
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public createdAt!: Date

  /**
   * The player asked
   */
  @ManyToOne({ entity: () => Player, references: (row) => row.toGameId })
  public other?: Player
}
