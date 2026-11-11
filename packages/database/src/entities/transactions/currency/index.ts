import { Entity, Field, Id, type idKey, ManyToOne } from 'uql-orm'

import { Transaction } from '#database/entities/transactions/transaction'

/**
 * A currency a transaction changed
 * @class
 */
@Entity<TransactionCurrency>({
  name: 'transaction_currencies',
  checks: [
    {
      name: 'transaction_currencies_currency_check',
      where: { currency: { $gte: 0, $lte: 11 } },
    },
    {
      name: 'transaction_currencies_balance_check',
      where: { balance: { $gte: 0 } },
    },
  ],
})
export class TransactionCurrency {
  /**
   * The key fields
   */
  declare public [idKey]?: 'transactionId' | 'currency'

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
   * The currency
   */
  @Id({ type: Number, columnType: 'smallint' })
  public currency!: number

  /**
   * How much it changed by
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public change!: number

  /**
   * The new balance
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public balance!: number

  /**
   * The transaction it belongs to
   */
  @ManyToOne({
    entity: () => Transaction,
    references: (currency) => currency.transactionId,
  })
  public transaction?: Transaction
}
