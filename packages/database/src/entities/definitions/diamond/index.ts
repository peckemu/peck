import { Entity, Field, Id, type idKey } from 'uql-orm'

/**
 * A diamond shop entry
 * @class
 */
@Entity<DiamondDefinition>({
  name: 'diamond_definitions',
  indexes: [
    {
      name: 'diamond_definitions_ref',
      columns: (entry) => [entry.type, entry.refId],
    },
  ],
  checks: [
    { name: 'diamond_definitions_cost_check', where: { cost: { $gte: 0 } } },
  ],
})
export class DiamondDefinition {
  /**
   * The key field
   */
  declare public [idKey]?: 'defId'

  /**
   * The entry's id in the diamond pack
   */
  @Id({ type: Number, columnType: 'integer' })
  public defId!: number

  /**
   * What kind of thing it sells
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public type!: number

  /**
   * The definition id of what it sells
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public refId!: number

  /**
   * What it costs in diamonds
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public cost!: number

  /**
   * Its store status
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public status!: number

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
