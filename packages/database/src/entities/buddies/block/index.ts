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
 * A player blocking another
 * @class
 */
@Entity<Block>({
  name: 'blocks',
  indexes: [{ name: 'blocks_blocked', columns: (row) => [row.blockedGameId] }],
  checks: [
    {
      name: 'blocks_self_check',
      where: (row) => sql`${row.blockerGameId} <> ${row.blockedGameId}`,
    },
  ],
})
export class Block {
  /**
   * The key fields
   */
  declare public [idKey]?: 'blockerGameId' | 'blockedGameId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'createdAt'

  /**
   * The player blocking
   */
  @Id({
    type: Number,
    columnType: 'integer',
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public blockerGameId!: number

  /**
   * The player blocked
   */
  @Id({
    type: Number,
    columnType: 'integer',
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public blockedGameId!: number

  /**
   * When it was made
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public createdAt!: Date

  /**
   * The player blocked
   */
  @ManyToOne({ entity: () => Player, references: (row) => row.blockedGameId })
  public other?: Player
}
