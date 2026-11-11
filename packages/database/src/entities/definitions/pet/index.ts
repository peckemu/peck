import { Entity, Field, Id, type idKey } from 'uql-orm'

/**
 * A pet
 * @class
 */
@Entity<PetDefinition>({
  name: 'pet_definitions',
  checks: [
    { name: 'pet_definitions_cost_check', where: { cost: { $gte: 0 } } },
  ],
})
export class PetDefinition {
  /**
   * The key field
   */
  declare public [idKey]?: 'defId'

  /**
   * The pet's id in the pet pack
   */
  @Id({ type: Number, columnType: 'integer' })
  public defId!: number

  /**
   * The pet's name
   */
  @Field({ type: 'text', nullable: true })
  public name?: string | null

  /**
   * The pet's name string id
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public titleStrId!: number

  /**
   * The pet's art
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public mediaRefId!: number

  /**
   * Its pet kind
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public type!: number

  /**
   * Whether only members can have it
   */
  @Field({ type: Boolean, nullable: false })
  public membersOnly!: boolean

  /**
   * What the shop charges
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public cost!: number

  /**
   * The pet's status
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public status!: number

  /**
   * Its toys
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public toyListId!: number

  /**
   * The list of what it eats
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public foodListId!: number

  /**
   * Whether it is a reward
   */
  @Field({ type: Boolean, nullable: false })
  public reward!: boolean

  /**
   * Whether it hatches from an egg
   */
  @Field({ type: Boolean, nullable: false })
  public egg!: boolean

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
