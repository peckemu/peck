import { Entity, Field, type filledKey, Id, type idKey } from 'uql-orm'

/**
 * An eco score den item
 * @class
 */
@Entity<EcoGift>({
  name: 'eco_gifts',
  checks: [
    {
      name: 'eco_gifts_bit_idx_check',
      where: { bitIdx: { $gte: 0, $lte: 30 } },
    },
    {
      name: 'eco_gifts_score_required_check',
      where: { scoreRequired: { $gte: 0 } },
    },
    {
      name: 'eco_gifts_den_item_def_id_check',
      where: { denItemDefId: { $gt: 0 } },
    },
    { name: 'eco_gifts_color_check', where: { color: { $gte: 0, $lte: 255 } } },
  ],
})
export class EcoGift {
  /**
   * The key field
   */
  declare public [idKey]?: 'bitIdx'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'color' | 'nameStrId' | 'descStrId'

  /**
   * The gift's bit
   */
  @Id({ type: Number, columnType: 'smallint' })
  public bitIdx!: number

  /**
   * The eco score needed
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public scoreRequired!: number

  /**
   * The den item's definition id
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public denItemDefId!: number

  /**
   * The den item's colour
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public color!: number

  /**
   * The gift's name string id
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public nameStrId!: number

  /**
   * The gift's description string id
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public descStrId!: number
}
