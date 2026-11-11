import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  type Json,
  uuid,
} from 'uql-orm'

import { Account } from '#database/entities/accounts/account'

/**
 * Every audited action
 */
export const AUDIT_ACTIONS = [
  'role.created',
  'role.updated',
  'role.deleted',
  'member.role_changed',
  'override.granted',
  'override.revoked',
  'override.removed',
  'server.drained',
  'server.reopened',
  'masterpiece.approved',
  'masterpiece.rejected',
  'player.banned',
  'player.muted',
  'player.kicked',
  'player.invisible',
  'sanction.lifted',
  'report.resolved',
] as const

/**
 * An audited action
 */
export type AuditAction = (typeof AUDIT_ACTIONS)[number]

/**
 * An audit target
 */
export const AUDIT_TARGETS = [
  'account',
  'role',
  'server',
  'masterpiece',
  'player',
  'report',
] as const

/**
 * An audit target
 */
export type AuditTarget = (typeof AUDIT_TARGETS)[number]

/**
 * A change staff made
 * @class
 */
@Entity<AuditEntry>({
  name: 'audit_log',
  indexes: [
    {
      name: 'audit_log_at_index',
      columns: (entry) => [{ column: entry.at, order: 'desc' }],
    },
  ],
})
export class AuditEntry {
  /**
   * The key field
   */
  declare public [idKey]?: 'id'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'id' | 'at' | 'targetName' | 'detail'

  /**
   * The entry id
   */
  @Id({ type: 'uuid', defaultValue: uuid })
  public id!: string

  /**
   * When it happened
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public at!: Date

  /**
   * Who did it
   */
  @Field({ references: () => Account, nullable: true, onDelete: 'SET NULL' })
  public actorId?: string | null

  /**
   * What they did
   */
  @Field({ type: 'text', nullable: false, enum: AUDIT_ACTIONS })
  public action!: AuditAction

  /**
   * The target's kind
   */
  @Field({ type: 'text', nullable: false, enum: AUDIT_TARGETS })
  public targetKind!: AuditTarget

  /**
   * The target's id
   */
  @Field({ type: 'text', nullable: false })
  public targetId!: string

  /**
   * The target's name
   */
  @Field({ type: 'text', nullable: false, defaultValue: '' })
  public targetName!: string

  /**
   * The details
   */
  @Field({ type: 'jsonb', nullable: false, defaultValue: {} })
  public detail!: Json
}
