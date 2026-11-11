import {
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  type Json,
  sql,
} from 'uql-orm'

/**
 * A clothing item
 * @class
 */
@Entity<ItemDefinition>({
  name: 'item_definitions',
  checks: [
    { name: 'item_definitions_cost_check', where: { cost: { $gte: 0 } } },
    {
      name: 'item_definitions_recycle_value_check',
      where: { recycleValue: { $gte: 0 } },
    },
    {
      name: 'item_definitions_enviro_type_check',
      where: { enviroType: { $between: [0, 2] } },
    },
    {
      name: 'item_definitions_colors_check',
      where: (definition) => sql`jsonb_typeof(${definition.colors}) = 'array'`,
    },
  ],
})
export class ItemDefinition {
  /**
   * The key field
   */
  declare public [idKey]?: 'defId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?:
    | 'combinedCost'
    | 'giftable'
    | 'membersOnly'
    | 'defense'
    | 'attack'
    | 'attackMediaRefId'
    | 'combatType'
    | 'modifierType'
    | 'modifierValue'
    | 'criticalHit'

  /**
   * The item's id in the item pack
   */
  @Id({ type: Number, columnType: 'integer' })
  public defId!: number

  /**
   * The item's name
   */
  @Field({ type: 'text', nullable: true })
  public name?: string | null

  /**
   * The accessory the item draws
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public accId!: number

  /**
   * The item's layer
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public layerId!: number

  /**
   * The item's name string id
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public titleStrId!: number

  /**
   * The kind of item
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public type!: number

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
  @Field({ type: 'text', nullable: false, defaultValue: '' })
  public combinedCost!: string

  /**
   * The gems recycling it gives
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public recycleValue!: number

  /**
   * The item's status
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public status!: number

  /**
   * Whether it can be gifted
   */
  @Field({ type: Boolean, nullable: false, defaultValue: false })
  public giftable!: boolean

  /**
   * Whether only members can have it
   */
  @Field({ type: Boolean, nullable: false, defaultValue: false })
  public membersOnly!: boolean

  /**
   * Land 0, ocean 1 or both 2
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public enviroType!: number

  /**
   * The animals it fits
   */
  @Field({ type: Number, columnType: 'bigint', nullable: false })
  public avatarUseFlags!: number

  /**
   * The colours it comes in
   */
  @Field({ type: 'jsonb', nullable: false })
  public colors!: Json<number[]>

  /**
   * Its defence in adventures
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public defense!: number

  /**
   * Its attack in adventures
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public attack!: number

  /**
   * The media its attack plays
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public attackMediaRefId!: number

  /**
   * The kind of attack
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public combatType!: number

  /**
   * The kind of modifier
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public modifierType!: number

  /**
   * How much the modifier gives
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public modifierValue!: number

  /**
   * The chance of a critical hit
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public criticalHit!: number

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
