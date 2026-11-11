import { Entity, Field, Id, type idKey } from 'uql-orm'

/**
 * A den
 * @class
 */
@Entity<DenRoomDefinition>({
  name: 'den_room_definitions',
  checks: [
    { name: 'den_room_definitions_cost_check', where: { cost: { $gte: 0 } } },
  ],
})
export class DenRoomDefinition {
  /**
   * The key field
   */
  declare public [idKey]?: 'defId'

  /**
   * The den's pack id
   */
  @Id({ type: Number, columnType: 'integer' })
  public defId!: number

  /**
   * The den's name
   */
  @Field({ type: 'text', nullable: true })
  public name?: string | null

  /**
   * The den's name string id
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public titleStrId!: number

  /**
   * The den's room
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public roomDefId!: number

  /**
   * Land 0 or ocean 1
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public enviroType!: number

  /**
   * What the den shop charges
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public cost!: number

  /**
   * The den's picture
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public mediaRef!: number

  /**
   * The den's icon
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public iconMediaRef!: number

  /**
   * The den's status in the shop
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public status!: number

  /**
   * Whether only members can have it
   */
  @Field({ type: Boolean, nullable: false })
  public membersOnly!: boolean

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
