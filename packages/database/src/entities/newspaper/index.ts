import { Entity, Field, Id, type idKey, ManyToOne } from 'uql-orm'

import { Player } from '#database/entities/player'

/**
 * A newspaper a player has seen
 * @class
 */
@Entity({ name: 'newspaper_seen' })
export class NewspaperSeen {
  /**
   * The key fields
   */
  declare public [idKey]?: 'gameId' | 'defId'

  /**
   * The viewer
   */
  @Id({
    type: Number,
    columnType: 'integer',
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public gameId!: number

  /**
   * The newspaper's definition id
   */
  @Id({ type: Number, columnType: 'integer' })
  public defId!: number

  /**
   * The seen time in milliseconds
   */
  @Field({ type: Number, columnType: 'bigint', nullable: false })
  public seenTs!: number

  /**
   * The viewer
   */
  @ManyToOne({ entity: () => Player, references: (seen) => seen.gameId })
  public player?: Player
}
