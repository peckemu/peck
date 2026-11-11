import { type AuditEntry, type PermissionRow } from '@peck/database'
import { type Json } from 'uql-orm'

/**
 * A permission view
 */
export type PermissionView = {
  /**
   * The permission key
   */
  readonly key: string

  /**
   * Its group
   */
  readonly group: string

  /**
   * Its name
   */
  readonly label: string

  /**
   * What it allows
   */
  readonly description: string
}

/**
 * An audit entry view
 */
export type AuditView = {
  /**
   * The entry id
   */
  readonly id: string

  /**
   * When it happened
   */
  readonly at: string

  /**
   * The actor, or null
   */
  readonly actorId: string | null

  /**
   * What they did
   */
  readonly action: string

  /**
   * The target's kind
   */
  readonly targetKind: string

  /**
   * The target's id
   */
  readonly targetId: string

  /**
   * The target's name
   */
  readonly targetName: string

  /**
   * The details
   */
  readonly detail: Json
}

/**
 * Turns a permission into a response
 * @param permission The permission
 * @returns The permission
 */
export const permissionView = (permission: PermissionRow): PermissionView => ({
  key: permission.key,
  group: permission.group,
  label: permission.label,
  description: permission.description,
})

/**
 * Turns an audit entry into a response
 * @param entry The entry
 * @returns The entry
 */
export const auditView = (entry: AuditEntry): AuditView => ({
  id: entry.id,
  at: entry.at.toISOString(),
  actorId: entry.actorId ?? null,
  action: entry.action,
  targetKind: entry.targetKind,
  targetId: entry.targetId,
  targetName: entry.targetName,
  detail: entry.detail,
})
