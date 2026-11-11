import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
} from 'uql-orm'

import { Account } from '#database/entities/accounts/account'
import { PermissionRow } from '#database/entities/access/permission'

/**
 * Whether an override grants or revokes
 */
export const OVERRIDE_EFFECTS = ['grant', 'revoke'] as const

/**
 * Whether an override grants or revokes
 */
export type OverrideEffect = (typeof OVERRIDE_EFFECTS)[number]

/**
 * An account's permission override
 * @class
 */
@Entity<PermissionOverride>({ name: 'permission_overrides' })
export class PermissionOverride {
  /**
   * The key fields
   */
  declare public [idKey]?: 'accountId' | 'permission'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'createdAt'

  /**
   * The account
   */
  @Id({ type: 'uuid', references: () => Account, onDelete: 'CASCADE' })
  public accountId!: string

  /**
   * The permission
   */
  @Id({ type: 'text', references: () => PermissionRow, onDelete: 'CASCADE' })
  public permission!: string

  /**
   * Whether it grants or revokes
   */
  @Field({ type: 'text', nullable: false, enum: OVERRIDE_EFFECTS })
  public effect!: OverrideEffect

  /**
   * Who made it
   */
  @Field({ references: () => Account, nullable: true, onDelete: 'SET NULL' })
  public createdBy?: string | null

  /**
   * When it was made
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public createdAt!: Date
}
