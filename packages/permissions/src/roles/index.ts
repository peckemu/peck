import { type Permission, PERMISSION_KEYS } from '#permissions/permissions'

/**
 * The owner's rank
 */
export const OWNER_RANK = 100

/**
 * A role
 */
export type RoleDetails = {
  /**
   * Its name
   */
  readonly name: string

  /**
   * What it is for
   */
  readonly description: string

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
  readonly permissions: readonly Permission[]
}

/**
 * The roles by key
 */
export const ROLES = {
  owner: {
    name: 'Peck Owner',
    description: 'Runs Peck',
    color: '#e1283c',
    rank: OWNER_RANK,
    permissions: PERMISSION_KEYS,
  },
  admin: {
    name: 'Peck Admin',
    description: 'Manages staff and accounts',
    color: '#f0b43c',
    rank: 80,
    permissions: [
      'accounts.read',
      'accounts.manage',
      'accounts.grant',
      'roles.read',
      'roles.manage',
      'audit.read',
      'players.moderate',
      'masterpieces.review',
    ],
  },
  moderator: {
    name: 'Peck Moderator',
    description: 'Keeps players safe',
    color: '#7a4e2d',
    rank: 40,
    permissions: ['accounts.read', 'players.moderate', 'masterpieces.review'],
  },
  support: {
    name: 'Peck Support',
    description: 'Helps players with their accounts',
    color: '#c8965f',
    rank: 20,
    permissions: ['accounts.read'],
  },
} as const satisfies Record<string, RoleDetails>

/**
 * A role key
 */
export type RoleKey = keyof typeof ROLES

/**
 * Every role key
 */
export const ROLE_KEYS = Object.keys(ROLES) as RoleKey[]
