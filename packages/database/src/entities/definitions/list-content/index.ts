import { Entity, Field, Id, type idKey, type Json } from 'uql-orm'

/**
 * A recorded generic list
 * @class
 */
@Entity<GenericListContent>({ name: 'generic_list_contents' })
export class GenericListContent {
  /**
   * The key field
   */
  declare public [idKey]?: 'listId'

  /**
   * The list's id
   */
  @Id({ type: Number, columnType: 'integer' })
  public listId!: number

  /**
   * Its other fields
   */
  @Field({ type: 'jsonb', nullable: false })
  public fields!: Json<string[]>
}
