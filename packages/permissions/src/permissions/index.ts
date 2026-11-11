/**
 * A permission's details
 */
export type PermissionDetails = {
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
 * Every permission
 */
export const PERMISSIONS = {
  'accounts.read': {
    group: 'Accounts',
    label: 'View accounts',
    description: 'See accounts and their players',
  },
  'accounts.manage': {
    group: 'Accounts',
    label: 'Manage accounts',
    description: 'Change accounts and sign them out',
  },
  'accounts.grant': {
    group: 'Accounts',
    label: 'Grant permissions',
    description: 'Grant or revoke single permissions for an account',
  },
  'roles.read': {
    group: 'Roles',
    label: 'View roles',
    description: 'See roles and who holds them',
  },
  'roles.manage': {
    group: 'Roles',
    label: 'Manage roles',
    description: 'Create, change, delete and assign roles below your own',
  },
  'audit.read': {
    group: 'Audit',
    label: 'View the audit log',
    description: 'See every change staff have made',
  },
  'players.moderate': {
    group: 'Players',
    label: 'Moderate players',
    description: 'Mute, kick and ban players',
  },
  'masterpieces.review': {
    group: 'Players',
    label: 'Review masterpieces',
    description: 'Approve or reject masterpieces from the art studio',
  },
  'server.manage': {
    group: 'Server',
    label: 'Manage the server',
    description: 'Change how the server runs',
  },
} as const satisfies Record<string, PermissionDetails>

/**
 * A permission key
 */
export type Permission = keyof typeof PERMISSIONS

/**
 * Every permission key, in order
 */
export const PERMISSION_KEYS = Object.keys(PERMISSIONS) as Permission[]

/**
 * Checks a string is a permission key
 * @param value The string
 * @returns Whether it is
 */
export const isPermission = (value: string): value is Permission =>
  Object.hasOwn(PERMISSIONS, value)
