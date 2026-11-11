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
 * A picked up world item
 * @class
 */
@Entity<WorldItemClaim>({ name: 'world_item_claims' })
export class WorldItemClaim {
  /**
   * The key fields
   */
  declare public [idKey]?: 'gameId' | 'worldItemDefId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'claimedAt'

  /**
   * The picker
   */
  @Id({
    type: Number,
    columnType: 'integer',
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public gameId!: number

  /**
   * The world item's definition id
   */
  @Id({ type: Number, columnType: 'integer' })
  public worldItemDefId!: number

  /**
   * When it was picked up
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public claimedAt!: Date

  /**
   * The picker
   */
  @ManyToOne({ entity: () => Player, references: (claim) => claim.gameId })
  public player?: Player
}
