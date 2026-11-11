import { inject, injectable } from '@needle-di/core'
import {
  AccessRepository,
  type AccessState,
  type AuditEntry,
  AuditRepository,
  type OverrideEffect,
  type PermissionRow,
  type RoleInput,
  type RoleView,
} from '@peck/database'
import {
  type Actor,
  canGrant,
  canManageRole,
  effectivePermissions,
  isOwner,
  isPermission,
  roleProblems,
} from '@peck/permissions'

import { ServiceError } from '#api/errors'

/**
 * What an account may do
 */
export type Access = Actor & {
  /**
   * The account id
   */
  readonly accountId: string

  /**
   * The account's role, or null
   */
  readonly role: RoleView | null

  /**
   * Whether the account is the owner
   */
  readonly owner: boolean
}

/**
 * Checks and changes who may do what
 * @class
 */
@injectable()
export class AccessService {
  /**
   * The access rows
   */
  private readonly access = inject<AccessRepository>(AccessRepository)

  /**
   * The audit log
   */
  private readonly audit = inject<AuditRepository>(AuditRepository)

  /**
   * Works out what an account may do
   * @param accountId The account id
   * @returns The access
   */
  public async of(accountId: string): Promise<Access> {
    const state = await this.access.stateOf(accountId)
    if (!state) throw new ServiceError('Account not found', 'NOT_FOUND')

    return {
      accountId,
      role: state.role,
      rank: state.role?.rank ?? 0,
      permissions: effectivePermissions(state.role, state.overrides),
      owner: isOwner(state.role),
    }
  }

  /**
   * Lists every permission
   * @returns The permissions
   */
  public async permissions(): Promise<PermissionRow[]> {
    return this.access.permissions()
  }

  /**
   * Lists every role
   * @returns The roles
   */
  public async roles(): Promise<RoleView[]> {
    return this.access.roles()
  }

  /**
   * Creates a role
   * @param actor Who is creating it
   * @param input The role
   * @returns The role
   */
  public async createRole(actor: Access, input: RoleInput): Promise<RoleView> {
    AccessService.check(actor, input)

    return this.access.createRole(input, actor.accountId)
  }

  /**
   * Changes a role
   * @param actor Who is changing it
   * @param id The role id
   * @param input The role
   * @returns The role
   */
  public async updateRole(
    actor: Access,
    id: string,
    input: RoleInput,
  ): Promise<RoleView> {
    const role = await this.managed(actor, id)

    AccessService.check(actor, input)

    return this.access.updateRole(role.id, input, actor.accountId)
  }

  /**
   * Deletes a role
   * @param actor Who is deleting it
   * @param id The role id
   */
  public async deleteRole(actor: Access, id: string): Promise<void> {
    const role = await this.managed(actor, id)

    if ((await this.access.holders(role.id)) > 0) {
      throw new ServiceError('Role is still held by accounts', 'CONFLICT')
    }

    await this.access.deleteRole(role, actor.accountId)
  }

  /**
   * Gives an account a role, or takes it away
   * @param actor Who is changing it
   * @param accountId The account id
   * @param roleId The role id, or null
   */
  public async assignRole(
    actor: Access,
    accountId: string,
    roleId: string | null,
  ): Promise<void> {
    const target = await this.target(actor, accountId)

    if (target.role && !canManageRole(actor, target.role)) {
      throw new ServiceError(
        "You can't change this account's role",
        'FORBIDDEN',
      )
    }

    const role = roleId === null ? null : await this.access.role(roleId)
    if (roleId !== null && !role) {
      throw new ServiceError('Role not found', 'NOT_FOUND')
    }
    if (role && !canManageRole(actor, role)) {
      throw new ServiceError("You can't give out this role", 'FORBIDDEN')
    }

    await this.access.assignRole(
      accountId,
      target.username,
      role,
      actor.accountId,
    )
  }

  /**
   * Sets a permission override
   * @param actor Who is changing it
   * @param accountId The account id
   * @param permission The permission
   * @param effect The effect, or null
   */
  public async setOverride(
    actor: Access,
    accountId: string,
    permission: string,
    effect: OverrideEffect | null,
  ): Promise<void> {
    if (!isPermission(permission)) {
      throw new ServiceError('Permission not found', 'NOT_FOUND')
    }
    if (!canGrant(actor, permission)) {
      throw new ServiceError("You don't have this permission", 'FORBIDDEN')
    }

    const target = await this.target(actor, accountId)

    if ((target.role?.rank ?? 0) >= actor.rank) {
      throw new ServiceError(
        "You can't change this account's permissions",
        'FORBIDDEN',
      )
    }

    await this.access.setOverride(
      accountId,
      target.username,
      permission,
      effect,
      actor.accountId,
    )
  }

  /**
   * Lists the audit log
   * @param limit The page size
   * @param offset The entries to skip
   * @returns The entries
   */
  public async auditLog(limit: number, offset: number): Promise<AuditEntry[]> {
    return this.audit.list(limit, offset)
  }

  /**
   * Finds a role the actor may manage
   * @param actor Who is acting
   * @param id The role id
   * @returns The role
   */
  private async managed(actor: Access, id: string): Promise<RoleView> {
    const role = await this.access.role(id)
    if (!role) throw new ServiceError('Role not found', 'NOT_FOUND')

    if (role.builtIn) {
      throw new ServiceError("Peck roles can't be changed", 'FORBIDDEN')
    }
    if (!canManageRole(actor, role)) {
      throw new ServiceError("You can't manage this role", 'FORBIDDEN')
    }

    return role
  }

  /**
   * Finds an account the actor may change
   * @param actor Who is acting
   * @param accountId The account id
   * @returns The account's state
   */
  private async target(actor: Access, accountId: string): Promise<AccessState> {
    if (accountId === actor.accountId) {
      throw new ServiceError("You can't change your own access", 'FORBIDDEN')
    }

    const state = await this.access.stateOf(accountId)
    if (!state) throw new ServiceError('Account not found', 'NOT_FOUND')

    return state
  }

  /**
   * Refuses an invalid role
   * @param actor Who is saving it
   * @param input The role
   */
  private static check(actor: Access, input: RoleInput): void {
    const problems = roleProblems(input, actor)

    if (problems.length > 0) {
      throw new ServiceError(problems.join(', '), 'INVALID')
    }
  }
}
