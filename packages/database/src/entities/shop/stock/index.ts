import { Entity, Field, Id, type idKey } from 'uql-orm'

/**
 * Something a shop sells
 * @class
 */
@Entity<ShopStock>({
  name: 'shop_stock',
  checks: [
    { name: 'shop_stock_position_check', where: { position: { $gte: 0 } } },
  ],
})
export class ShopStock {
  /**
   * The key fields
   */
  declare public [idKey]?: 'listId' | 'listType' | 'defId'

  /**
   * The shop's list id
   */
  @Id({ type: Number, columnType: 'integer' })
  public listId!: number

  /**
   * Its kind
   */
  @Id({ type: Number, columnType: 'integer' })
  public listType!: number

  /**
   * Its definition id
   */
  @Id({ type: Number, columnType: 'integer' })
  public defId!: number

  /**
   * Where it goes on the shelf
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public position!: number
}
