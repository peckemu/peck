import { Entity, Field, type filledKey, Id, type idKey } from 'uql-orm'

import { Trade } from '#database/entities/trade/trade'

/**
 * A traded thing
 * @class
 */
@Entity<TradeItem>({
  name: 'trade_items',
  checks: [
    {
      name: 'trade_items_item_kind_check',
      where: { itemKind: { $gte: 0, $lte: 2 } },
    },
  ],
})
export class TradeItem {
  /**
   * The key fields
   */
  declare public [idKey]?: 'tradeId' | 'fromGameId' | 'itemKind' | 'invIdx'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'color' | 'version' | 'lBits' | 'uBits' | 'eBits'

  /**
   * The trade
   */
  @Id({
    type: Number,
    columnType: 'bigint',
    references: () => Trade,
    onDelete: 'CASCADE',
  })
  public tradeId!: number

  /**
   * The giver
   */
  @Id({ type: Number, columnType: 'integer' })
  public fromGameId!: number

  /**
   * Den item 0, pet 1 or clothing 2
   */
  @Id({ type: Number, columnType: 'smallint' })
  public itemKind!: number

  /**
   * Its place in the giver's inventory
   */
  @Id({ type: Number, columnType: 'integer' })
  public invIdx!: number

  /**
   * Its place in the receiver's inventory
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public givenInvIdx!: number

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
   * Which of its looks
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public version!: number

  /**
   * A pet's look
   */
  @Field({
    type: Number,
    columnType: 'bigint',
    nullable: false,
    defaultValue: 0,
  })
  public lBits!: number

  /**
   * More of a pet's look
   */
  @Field({
    type: Number,
    columnType: 'bigint',
    nullable: false,
    defaultValue: 0,
  })
  public uBits!: number

  /**
   * The rest of a pet's look
   */
  @Field({
    type: Number,
    columnType: 'bigint',
    nullable: false,
    defaultValue: 0,
  })
  public eBits!: number
}
