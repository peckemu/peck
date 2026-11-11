import { Entity, Field, Id, type idKey } from 'uql-orm'

/**
 * A permission
 * @class
 */
@Entity<PermissionRow>({
  name: 'permissions',
  checks: [
    {
      name: 'permissions_key_check',
      where: { key: { $regex: '^[a-z_]+\\.[a-z_]+$' } },
    },
  ],
})
export class PermissionRow {
  /**
   * The key field
   */
  declare public [idKey]?: 'key'

  /**
   * The permission key
   */
  @Id({ type: 'text' })
  public key!: string

  /**
   * Its group
   */
  @Field({ type: 'text', nullable: false })
  public group!: string

  /**
   * Its name
   */
  @Field({ type: 'text', nullable: false })
  public label!: string

  /**
   * What it allows
   */
  @Field({ type: 'text', nullable: false })
  public description!: string

  /**
   * Its place in the list
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public position!: number
}
