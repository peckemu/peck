import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  ManyToOne,
} from 'uql-orm'

import { Account } from '#database/entities/accounts/account'
import { Role } from '#database/entities/access/role'

/**
 * The role an account holds
 * @class
 */
@Entity<RoleAssignment>({ name: 'account_roles' })
export class RoleAssignment {
  /**
   * The key field
   */
  declare public [idKey]?: 'accountId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'grantedAt'

  /**
   * The account
   */
  @Id({ type: 'uuid', references: () => Account, onDelete: 'CASCADE' })
  public accountId!: string

  /**
   * The role
   */
  @Field({ type: 'uuid', references: () => Role, nullable: false })
  public roleId!: string

  /**
   * Who assigned it
   */
  @Field({ references: () => Account, nullable: true, onDelete: 'SET NULL' })
  public grantedBy?: string | null

  /**
   * When it was assigned
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public grantedAt!: Date

  /**
   * The role
   */
  @ManyToOne({
    entity: () => Role,
    references: (assignment) => assignment.roleId,
  })
  public role?: Role
}
