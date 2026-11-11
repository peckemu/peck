import {
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  ManyToOne,
} from 'uql-orm'

import { Transaction } from '#database/entities/transactions/transaction'

/**
 * What kind of thing a transaction moved
 */
export const TRANSACTION_ITEM_KINDS = [
  'clothing',
  'den-item',
  'den-room',
  'pet',
] as const

/**
 * What kind of thing a transaction moved
 */
export type TransactionItemKind = (typeof TRANSACTION_ITEM_KINDS)[number]

/**
 * A thing a transaction moved
 * @class
 */
@Entity<TransactionItem>({
  name: 'transaction_items',
  checks: [
    { name: 'transaction_items_seq_check', where: { seq: { $gte: 0 } } },
    { name: 'transaction_items_gems_check', where: { gems: { $gte: 0 } } },
    {
      name: 'transaction_items_color_check',
      where: { color: { $gte: 0, $lte: 4_294_967_295 } },
    },
    {
      name: 'transaction_items_l_bits_check',
      where: { lBits: { $gte: 0, $lte: 4_294_967_295 } },
    },
    {
      name: 'transaction_items_u_bits_check',
      where: { uBits: { $gte: 0, $lte: 4_294_967_295 } },
    },
    {
      name: 'transaction_items_e_bits_check',
      where: { eBits: { $gte: 0, $lte: 4_294_967_295 } },
    },
  ],
})
export class TransactionItem {
  /**
   * The key fields
   */
  declare public [idKey]?: 'transactionId' | 'seq'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?:
    'color' | 'version' | 'gems' | 'lBits' | 'uBits' | 'eBits'

  /**
   * The transaction it belongs to
   */
  @Id({
    type: Number,
    columnType: 'bigint',
    references: () => Transaction,
    onDelete: 'CASCADE',
  })
  public transactionId!: number

  /**
   * Its place in the transaction
   */
  @Id({ type: Number, columnType: 'smallint' })
  public seq!: number

  /**
   * Its kind
   */
  @Field({ type: 'text', nullable: false, enum: TRANSACTION_ITEM_KINDS })
  public itemKind!: TransactionItemKind

  /**
   * Its place in the player's inventory
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public invIdx!: number

  /**
   * Its definition id
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public defId!: number

  /**
   * Its colour
   */
  @Field({
    type: Number,
    columnType: 'bigint',
    nullable: false,
    defaultValue: 0,
  })
  public color!: number

  /**
   * Its version
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public version!: number

  /**
   * The gems it was worth
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public gems!: number

  /**
   * A pet's lower bits
   */
  @Field({
    type: Number,
    columnType: 'bigint',
    nullable: false,
    defaultValue: 0,
  })
  public lBits!: number

  /**
   * A pet's upper bits
   */
  @Field({
    type: Number,
    columnType: 'bigint',
    nullable: false,
    defaultValue: 0,
  })
  public uBits!: number

  /**
   * A pet's extra bits
   */
  @Field({
    type: Number,
    columnType: 'bigint',
    nullable: false,
    defaultValue: 0,
  })
  public eBits!: number

  /**
   * The transaction it belongs to
   */
  @ManyToOne({
    entity: () => Transaction,
    references: (item) => item.transactionId,
  })
  public transaction?: Transaction
}
