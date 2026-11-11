import { Entity, Field, Id, type idKey, type Json } from 'uql-orm'

/**
 * A party
 * @class
 */
@Entity<PartyDefinition>({ name: 'party_definitions' })
export class PartyDefinition {
  /**
   * The key field
   */
  declare public [idKey]?: 'defId'

  /**
   * The party's id in the party pack
   */
  @Id({ type: Number, columnType: 'integer' })
  public defId!: number

  /**
   * The party's name
   */
  @Field({ type: 'text', nullable: true })
  public name?: string | null

  /**
   * The party's name string id
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public titleStrId!: number

  /**
   * Its picture in the party list
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public mediaRefId!: number

  /**
   * Its hosting icon
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public iconMediaRefId!: number

  /**
   * Who can come
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public restrictions!: number

  /**
   * The animals allowed
   */
  @Field({ type: 'text', nullable: false })
  public avatarDefFlags!: string

  /**
   * The pets allowed
   */
  @Field({ type: 'jsonb', nullable: false })
  public petDefScalableFlags!: Json<number[]>

  /**
   * Whether it is a minigame
   */
  @Field({ type: Boolean, nullable: false })
  public isGame!: boolean

  /**
   * Whether players host it
   */
  @Field({ type: Boolean, nullable: false })
  public isCustom!: boolean

  /**
   * The venue room
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public roomDefId!: number
}
