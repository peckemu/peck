import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
} from 'uql-orm'

import { Player } from '#database/entities/player'

/**
 * A trade between two players
 * @class
 */
@Entity<Trade>({
  name: 'trades',
  indexes: [
    { name: 'trades_from', columns: (trade) => [trade.fromGameId] },
    { name: 'trades_to', columns: (trade) => [trade.toGameId] },
  ],
})
export class Trade {
  /**
   * The key field
   */
  declare public [idKey]?: 'id'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'id' | 'at'

  /**
   * The trade's id
   */
  @Id({ type: Number, columnType: 'bigint', autoIncrement: true })
  public id!: number

  /**
   * The asker
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public fromGameId!: number

  /**
   * The player asked
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
   * When it was made
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public at!: Date
}
