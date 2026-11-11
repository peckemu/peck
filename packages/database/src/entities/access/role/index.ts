import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  OneToMany,
  sql,
  uuid,
} from 'uql-orm'

import { Account } from '#database/entities/accounts/account'
import { RoleGrant } from '#database/entities/access/grant'

/**
 * A staff role
 * @class
 */
@Entity<Role>({
  name: 'roles',
  checks: [
    {
      name: 'roles_name_check',
      where: (role) => sql`char_length(btrim(${role.name})) BETWEEN 1 AND 40`,
    },
    {
      name: 'roles_description_check',
      where: (role) => sql`char_length(${role.description}) <= 280`,
    },
    {
      name: 'roles_color_check',
      where: { color: { $regex: '^#[0-9a-fA-F]{6}$' } },
    },
    { name: 'roles_rank_check', where: { rank: { $between: [1, 100] } } },
    {
      name: 'roles_built_in_check',
      where: (role) => sql`${role.builtIn} = (${role.key} IS NOT NULL)`,
    },
    {
      name: 'roles_owner_check',
      where: (role) => sql`${role.builtIn} OR ${role.rank} < 100`,
    },
  ],
})
export class Role {
  /**
   * The key field
   */
  declare public [idKey]?: 'id'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?:
    'id' | 'key' | 'description' | 'builtIn' | 'createdAt' | 'updatedAt'

  /**
   * The role id
   */
  @Id({ type: 'uuid', defaultValue: uuid })
  public id!: string

  /**
   * The built-in key, or null
   */
  @Field({ type: 'text', nullable: true, unique: true })
  public key?: string | null

  /**
   * The role name
   */
  @Field({ type: 'text', nullable: false })
  public name!: string

  /**
   * The role's purpose
   */
  @Field({ type: 'text', nullable: false, defaultValue: '' })
  public description!: string

  /**
   * The role colour
   */
  @Field({ type: 'text', nullable: false })
  public color!: string

  /**
   * The role rank
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public rank!: number

  /**
   * Whether the role is built in
   */
  @Field({ type: Boolean, nullable: false, defaultValue: false })
  public builtIn!: boolean

  /**
   * Who created it
   */
  @Field({ references: () => Account, nullable: true, onDelete: 'SET NULL' })
  public createdBy?: string | null

  /**
   * When it was created
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public createdAt!: Date

  /**
   * When it was last changed
   */
  @Field({
    type: Date,
    nullable: false,
    defaultValue: currentTimestamp,
    onUpdate: () => new Date(),
  })
  public updatedAt!: Date

  /**
   * The role's permissions
   */
  @OneToMany({ entity: () => RoleGrant, mappedBy: (grant) => grant.role })
  public grants?: RoleGrant[]
}
