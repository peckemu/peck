import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  ManyToOne,
} from 'uql-orm'

import { Account } from '../../accounts/account/index.ts'
import { PermissionRow } from '../permission/index.ts'
import { Role } from '../role/index.ts'

/**
 * A permission a role holds
 * @class
 */
@Entity<RoleGrant>({ name: 'role_permissions' })
export class RoleGrant {
  /**
   * The key fields
   */
  declare public [idKey]?: 'roleId' | 'permission'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'grantedAt'

  /**
   * The role
   */
  @Id({ type: 'uuid', references: () => Role, onDelete: 'CASCADE' })
  public roleId!: string

  /**
   * The permission
   */
  @Id({ type: 'text', references: () => PermissionRow, onDelete: 'CASCADE' })
  public permission!: string

  /**
   * Who granted it
   */
  @Field({ references: () => Account, nullable: true, onDelete: 'SET NULL' })
  public grantedBy?: string | null

  /**
   * When it was granted
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public grantedAt!: Date

  /**
   * The role
   */
  @ManyToOne({ entity: () => Role, references: (grant) => grant.roleId })
  public role?: Role
}
