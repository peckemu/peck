import { Entity, Field, Id, type idKey } from 'uql-orm'

/**
 * A den item
 * @class
 */
@Entity<DenItemDefinition>({
  name: 'den_item_definitions',
  checks: [
    { name: 'den_item_definitions_cost_check', where: { cost: { $gte: 0 } } },
    {
      name: 'den_item_definitions_recycle_value_check',
      where: { recycleValue: { $gte: 0 } },
    },
  ],
})
export class DenItemDefinition {
  /**
   * The key field
   */
  declare public [idKey]?: 'defId'

  /**
   * The den item's pack id
   */
  @Id({ type: Number, columnType: 'integer' })
  public defId!: number

  /**
   * The den item's name
   */
  @Field({ type: 'text', nullable: true })
  public name?: string | null

  /**
   * The short name of its art
   */
  @Field({ type: 'text', nullable: false })
  public abbrName!: string

  /**
   * The den item's name string id
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public nameStrId!: number

  /**
   * Its special kind
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public specialType!: number

  /**
   * What the shop charges
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public cost!: number

  /**
   * The currency the shop charges in
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public currencyType!: number

  /**
   * The crafting cost
   */
  @Field({ type: 'text', nullable: false })
  public combinedCost!: string

  /**
   * The gems recycling it gives
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public recycleValue!: number

  /**
   * Whether only members can have it
   */
  @Field({ type: Boolean, nullable: false })
  public membersOnly!: boolean

  /**
   * The den item's status
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public status!: number

  /**
   * The category it sorts into
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public sortCat!: number

  /**
   * The category of its type
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public typeCat!: number

  /**
   * Land, ocean or both
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public enviroType!: number

  /**
   * Its layer
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public layer!: number

  /**
   * The den item's flag
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public flag!: number

  /**
   * The opened minigame, or 0
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public gameDefId!: number

  /**
   * The opened list, or 0
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public listId!: number

  /**
   * A mannequin's animal, or 0
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public mannequinAvatarDefId!: number

  /**
   * A mannequin's category, or 0
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public mannequinCatId!: number

  /**
   * Its list, or 0
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public parentArrayId!: number

  /**
   * Its promotion kind
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public promoType!: number

  /**
   * How big it is drawn
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public scalePercent!: number

  /**
   * Its eco score
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public ecoPower!: number

  /**
   * When it goes on sale
   */
  @Field({ type: Date, nullable: true })
  public availableFrom?: Date | null

  /**
   * When it stops being on sale
   */
  @Field({ type: Date, nullable: true })
  public availableUntil?: Date | null
}
