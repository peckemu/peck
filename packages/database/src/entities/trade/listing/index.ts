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
 * Something on a player's trade list
 * @class
 */
@Entity<TradeListing>({
  name: 'trade_list',
  checks: [
    {
      name: 'trade_list_item_kind_check',
      where: { itemKind: { $gte: 0, $lte: 2 } },
    },
  ],
})
export class TradeListing {
  /**
   * The key fields
   */
  declare public [idKey]?: 'gameId' | 'itemKind' | 'invIdx'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'addedAt'

  /**
   * The player trading it
   */
  @Id({
    type: Number,
    columnType: 'integer',
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public gameId!: number

  /**
   * Den item 0, pet 1 or clothing 2
   */
  @Id({ type: Number, columnType: 'smallint' })
  public itemKind!: number

  /**
   * Its place in the player's inventory
   */
  @Id({ type: Number, columnType: 'integer' })
  public invIdx!: number

  /**
   * When it was listed
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public addedAt!: Date

  /**
   * The player trading it
   */
  @ManyToOne({ entity: () => Player, references: (listing) => listing.gameId })
  public player?: Player
}
