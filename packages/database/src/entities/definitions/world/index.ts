import { Entity, Field, Id, type idKey } from 'uql-orm'

/**
 * A world item
 * @class
 */
@Entity<WorldItemDefinition>({ name: 'world_item_definitions' })
export class WorldItemDefinition {
  /**
   * The key field
   */
  declare public [idKey]?: 'defId'

  /**
   * The world item's id in the world items pack
   */
  @Id({ type: Number, columnType: 'integer' })
  public defId!: number

  /**
   * The kind of gift
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public giftType!: number

  /**
   * The gift's definition id
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public giftRefId!: number

  /**
   * How much it gives
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public amount!: number

  /**
   * Its place in the room
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public position!: number

  /**
   * The user variable it is kept in
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public userVarRefId!: number

  /**
   * Its bit in the user variable
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public uvIndex!: number

  /**
   * When it comes out
   */
  @Field({ type: Date, nullable: true })
  public availableFrom?: Date | null

  /**
   * When it goes away
   */
  @Field({ type: Date, nullable: true })
  public availableUntil?: Date | null
}
