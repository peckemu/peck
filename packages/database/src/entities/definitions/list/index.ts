import { Entity, Field, Id, type idKey, type Json } from 'uql-orm'

/**
 * A requestable generic list
 * @class
 */
@Entity<GenericListDefinition>({ name: 'generic_list_definitions' })
export class GenericListDefinition {
  /**
   * The key field
   */
  declare public [idKey]?: 'defId'

  /**
   * The list id
   */
  @Id({ type: Number, columnType: 'integer' })
  public defId!: number

  /**
   * Its body type
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public type!: number

  /**
   * What the whole list costs in diamonds
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public diamondCost!: number

  /**
   * Whether the list is bought whole
   */
  @Field({ type: Boolean, nullable: false })
  public diamondBundle!: boolean

  /**
   * The ids in the list
   */
  @Field({ type: 'jsonb', nullable: false })
  public ids!: Json<number[]>
}
