import { Entity, Field, Id, type idKey, type Json } from 'uql-orm'

/**
 * An animal
 * @class
 */
@Entity<AvatarDefinition>({
  name: 'avatar_definitions',
  checks: [
    { name: 'avatar_definitions_cost_check', where: { cost: { $gte: 0 } } },
  ],
})
export class AvatarDefinition {
  /**
   * The key field
   */
  declare public [idKey]?: 'defId'

  /**
   * The animal's id in the avatar pack
   */
  @Id({ type: Number, columnType: 'integer' })
  public defId!: number

  /**
   * The animal's name
   */
  @Field({ type: 'text', nullable: true })
  public name?: string | null

  /**
   * The animal's name string id
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public titleStrId!: number

  /**
   * The default colours
   */
  @Field({ type: 'jsonb', nullable: false })
  public colors!: Json<number[]>

  /**
   * Its eyes
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public eyesDefId!: number

  /**
   * Its pattern, or 0
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public patternDefId!: number

  /**
   * Whether only members can be it
   */
  @Field({ type: Boolean, nullable: false })
  public membersOnly!: boolean

  /**
   * Land, ocean or both
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public enviroTypeFlags!: number

  /**
   * The cost in gems
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public cost!: number

  /**
   * Whether it can be had now
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public availability!: number

  /**
   * The animal's status
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public status!: number
}
