import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  ManyToOne,
  OneToMany,
} from 'uql-orm'

import { Player } from '#database/entities/player'
import { TransactionCurrency } from '#database/entities/transactions/currency'
import { TransactionItem } from '#database/entities/transactions/item'

/**
 * A transaction's purpose
 */
export const TRANSACTION_KINDS = [
  'eco-credits',
  'eco-gift',
  'photo-booth',
  'buy',
  'bundle',
  'exchange',
  'donation',
  'recycle',
  'den-shop-purchase',
  'den-shop-sale',
  'party-host',
  'pet-salon',
  'masterpiece-refund',
  'daily-spin',
] as const

/**
 * A transaction's purpose
 */
export type TransactionKind = (typeof TRANSACTION_KINDS)[number]

/**
 * A change to what a player owns
 * @class
 */
@Entity<Transaction>({
  name: 'transactions',
  indexes: [
    {
      name: 'transactions_player',
      columns: (transaction) => [
        transaction.gameId,
        { column: transaction.at, order: 'desc' },
      ],
    },
  ],
})
export class Transaction {
  /**
   * The key field
   */
  declare public [idKey]?: 'id'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'id' | 'shopId' | 'diamondDefId' | 'at'

  /**
   * The transaction's id
   */
  @Id({ type: Number, columnType: 'bigint', autoIncrement: true })
  public id!: number

  /**
   * The transaction's player
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
   * What it was for
   */
  @Field({ type: 'text', nullable: false, enum: TRANSACTION_KINDS })
  public kind!: TransactionKind

  /**
   * The shop, or 0
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public shopId!: number

  /**
   * The diamond shop item, or 0
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public diamondDefId!: number

  /**
   * When it happened
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public at!: Date

  /**
   * The other player
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: true,
    references: () => Player,
    onDelete: 'SET NULL',
  })
  public counterpartGameId?: number | null

  /**
   * The transaction's player
   */
  @ManyToOne({
    entity: () => Player,
    references: (transaction) => transaction.gameId,
  })
  public player?: Player

  /**
   * The other player in it
   */
  @ManyToOne({
    entity: () => Player,
    references: (transaction) => transaction.counterpartGameId,
  })
  public counterpart?: Player

  /**
   * The currencies it changed
   */
  @OneToMany({
    entity: () => TransactionCurrency,
    mappedBy: (currency) => currency.transaction,
  })
  public currencies?: TransactionCurrency[]

  /**
   * The items it moved
   */
  @OneToMany({
    entity: () => TransactionItem,
    mappedBy: (item) => item.transaction,
  })
  public items?: TransactionItem[]
}
