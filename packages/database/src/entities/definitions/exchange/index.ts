import { Entity, Field, type filledKey, Id, type idKey } from 'uql-orm'

/**
 * A currency exchange
 * @class
 */
@Entity<ExchangeDefinition>({
  name: 'exchange_definitions',
  checks: [
    { name: 'exchange_definitions_cost_check', where: { cost: { $gte: 0 } } },
    {
      name: 'exchange_definitions_result_check',
      where: { result: { $gte: 0 } },
    },
  ],
})
export class ExchangeDefinition {
  /**
   * The key field
   */
  declare public [idKey]?: 'defId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'combinedCost'

  /**
   * The exchange's id in the exchange pack
   */
  @Id({ type: Number, columnType: 'integer' })
  public defId!: number

  /**
   * What it costs
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public cost!: number

  /**
   * The paid currency
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public currencyType!: number

  /**
   * The price in several currencies
   */
  @Field({ type: 'text', nullable: false, defaultValue: '' })
  public combinedCost!: string

  /**
   * How much it gives
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public result!: number

  /**
   * The given currency
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public resultType!: number

  /**
   * When it goes on sale
   */
  @Field({ type: Date, nullable: true })
  public availableFrom?: Date | null

  /**
   * When it comes off sale
   */
  @Field({ type: Date, nullable: true })
  public availableUntil?: Date | null
}
