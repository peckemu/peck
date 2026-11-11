import {
  isPermission,
  type Permission,
  PERMISSION_KEYS,
} from '#permissions/permissions'
import { OWNER_RANK } from '#permissions/roles'

/**
 * A role
 */
export type RuleRole = {
  /**
   * The built-in key, or null
   */
  readonly key: string | null

  /**
   * The rank
   */
  readonly rank: number

  /**
   * The permissions
   */
  readonly permissions: readonly string[]
}

/**
 * An account's permission override
 */
export type RuleOverride = {
  /**
   * The permission
   */
  readonly permission: string

  /**
   * Whether it is granted or revoked
   */
  readonly effect: 'grant' | 'revoke'
}

/**
 * Someone acting
 */
export type Actor = {
  /**
   * Their rank
   */
  readonly rank: number

  /**
   * Their permissions
   */
  readonly permissions: readonly Permission[]
}

/**
 * Checks a role is the owner role
 * @param role The role
 * @returns Whether it is
 */
export const isOwner = (role: RuleRole | null): boolean =>
  role?.key === 'owner' && role.rank === OWNER_RANK

/**
 * Works out what an account may do
 * @param role The account's role, or null
 * @param overrides The account's overrides
 * @returns The permissions
 */
export const effectivePermissions = (
  role: RuleRole | null,
  overrides: readonly RuleOverride[] = [],
): Permission[] => {
  if (!role) return []

  const permissions = new Set(role.permissions.filter(isPermission))

  if (!isOwner(role)) {
    for (const { permission, effect } of overrides) {
      if (!isPermission(permission)) continue
      if (effect === 'grant') permissions.add(permission)
      else permissions.delete(permission)
    }
  }

  return PERMISSION_KEYS.filter((permission) => permissions.has(permission))
}

/**
 * Checks someone holds a permission
 * @param actor Who is acting
 * @param permission The permission
 * @returns Whether they do
 */
export const can = (actor: Actor, permission: Permission): boolean =>
  actor.permissions.includes(permission)

/**
 * Checks someone may manage a role
 * @param actor Who is acting
 * @param role The role
 * @returns Whether they may
 */
export const canManageRole = (
  actor: Actor,
  role: { readonly rank: number },
): boolean => can(actor, 'roles.manage') && actor.rank > role.rank

/**
 * Checks someone may hand out a permission
 * @param actor Who is acting
 * @param permission The permission
 * @returns Whether they may
 */
export const canGrant = (actor: Actor, permission: Permission): boolean =>
  can(actor, permission)

/**
 * A role being saved
 */
export type RoleDraft = {
  /**
   * Its name
   */
  readonly name: string

  /**
   * Its colour
   */
  readonly color: string

  /**
   * Its rank
   */
  readonly rank: number

  /**
   * Its permissions
   */
  readonly permissions: readonly string[]
}

/**
 * Lists a role's problems
 * @param role The role
 * @param actor Who is saving it
 * @returns The problems
 */
export const roleProblems = (role: RoleDraft, actor: Actor): string[] => {
  const problems: string[] = []

  const name = role.name.trim()
  if (name.length < 1 || name.length > 40) {
    problems.push('Name must be 1 to 40 characters')
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(role.color)) {
    problems.push('Colour must be #rrggbb')
  }
  if (
    !Number.isInteger(role.rank) ||
    role.rank < 1 ||
    role.rank >= OWNER_RANK
  ) {
    problems.push('Rank must be 1 to 99')
  }
  if (role.rank >= actor.rank) problems.push('Rank must be below your own')

  const unknown = role.permissions.filter(
    (permission) => !isPermission(permission),
  )
  if (unknown.length > 0) {
    problems.push(`Unknown permissions ${unknown.join(', ')}`)
  }

  const beyond = role.permissions.filter(
    (permission) => isPermission(permission) && !canGrant(actor, permission),
  )
  if (beyond.length > 0) problems.push(`You don't have ${beyond.join(', ')}`)

  return problems
}
