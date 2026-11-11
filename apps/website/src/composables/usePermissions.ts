import { type Permission, ROLES } from '@peck/permissions'
import type { Access } from '~/types/api'

/**
 * What the composable gives
 */
type Permissions = {
  /**
   * The account's access
   */
  readonly access: Ref<Access | null>

  /**
   * The account's permissions
   */
  readonly permissions: ComputedRef<readonly Permission[]>

  /**
   * Whether someone is signed in
   */
  readonly isAuthenticated: ComputedRef<boolean>

  /**
   * Loads the account's access
   */
  readonly load: () => Promise<void>

  /**
   * Checks a permission
   */
  readonly can: (permission: Permission) => boolean

  /**
   * Checks for any of some permissions
   */
  readonly canAny: (permissions: readonly Permission[]) => boolean

  /**
   * Checks for all of some permissions
   */
  readonly canAll: (permissions: readonly Permission[]) => boolean

  /**
   * Checks the role's name
   */
  readonly is: (role: string) => boolean

  /**
   * Checks for any of some role names
   */
  readonly isAny: (roles: readonly string[]) => boolean

  /**
   * Checks the role's rank
   */
  readonly isAtLeast: (rank: number) => boolean

  /**
   * Checks for the owner
   */
  readonly isOwner: () => boolean

  /**
   * Checks for an admin or higher
   */
  readonly isAdmin: () => boolean

  /**
   * Checks for a moderator or higher
   */
  readonly isModerator: () => boolean
}

/**
 * Checks the signed in account's roles and permissions
 * @returns The checks
 */
export const usePermissions = (): Permissions => {
  const { status, token } = useAuth()
  const api = useApi()

  /**
   * The account's access
   */
  const access = useState<Access | null>('access', () => null)

  /**
   * Whether someone is signed in
   */
  const isAuthenticated = computed(() => status.value === 'authenticated')

  /**
   * The account's permissions
   */
  const permissions = computed(() => access.value?.permissions ?? [])

  /**
   * Loads the account's access
   */
  const load = async (): Promise<void> => {
    if (!isAuthenticated.value || !token.value) {
      access.value = null
      return
    }

    const response = await api.access.me.$get(
      {},
      { headers: { Authorization: token.value } },
    )

    access.value = response.status === 200 ? await response.json() : null
  }

  /**
   * Checks a permission
   * @param permission The permission
   * @returns Whether the account has it
   */
  const can = (permission: Permission): boolean =>
    permissions.value.includes(permission)

  /**
   * Checks for any of some permissions
   * @param wanted The permissions
   * @returns Whether the account has one
   */
  const canAny = (wanted: readonly Permission[]): boolean =>
    wanted.some((permission) => can(permission))

  /**
   * Checks for all of some permissions
   * @param wanted The permissions
   * @returns Whether the account has them all
   */
  const canAll = (wanted: readonly Permission[]): boolean =>
    wanted.every((permission) => can(permission))

  /**
   * Checks the role's name
   * @param role The role's name
   * @returns Whether it matches
   */
  const is = (role: string): boolean => access.value?.role?.name === role

  /**
   * Checks for any of some role names
   * @param roles The role names
   * @returns Whether one matches
   */
  const isAny = (roles: readonly string[]): boolean =>
    roles.some((role) => is(role))

  /**
   * Checks the role's rank
   * @param rank The lowest rank
   * @returns Whether it is high enough
   */
  const isAtLeast = (rank: number): boolean => (access.value?.rank ?? 0) >= rank

  /**
   * Checks for the owner
   * @returns Whether it is the owner
   */
  const isOwner = (): boolean => access.value?.owner ?? false

  /**
   * Checks for an admin or higher
   * @returns Whether it is
   */
  const isAdmin = (): boolean => isOwner() || isAtLeast(ROLES.admin.rank)

  /**
   * Checks for a moderator or higher
   * @returns Whether it is
   */
  const isModerator = (): boolean =>
    isOwner() || isAtLeast(ROLES.moderator.rank)

  return {
    access,
    permissions,
    isAuthenticated,
    load,
    can,
    canAny,
    canAll,
    is,
    isAny,
    isAtLeast,
    isOwner,
    isAdmin,
    isModerator,
  }
}
