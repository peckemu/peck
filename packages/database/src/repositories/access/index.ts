import { type Actor, effectivePermissions } from '@peck/permissions'
import { type SqlQuerier } from 'uql-orm'

import { RoleAssignment } from '#database/entities/access/assignment'
import { type AuditAction } from '#database/entities/access/audit'
import { RoleGrant } from '#database/entities/access/grant'
import {
  type OverrideEffect,
  PermissionOverride,
} from '#database/entities/access/override'
import { PermissionRow } from '#database/entities/access/permission'
import { Role } from '#database/entities/access/role'
import { Account } from '#database/entities/accounts/account'
import { type Database } from '#database/pool'
import { writeAudit } from '#database/repositories/audit'

/**
 * The audit action by effect
 */
const OVERRIDE_ACTIONS = {
  grant: 'override.granted',
  revoke: 'override.revoked',
} as const satisfies Record<OverrideEffect, AuditAction>

/**
 * A role
 */
export type RoleView = {
  /**
   * The role id
   */
  readonly id: string

  /**
   * The built-in key, or null
   */
  readonly key: string | null

  /**
   * The role name
   */
  readonly name: string

  /**
   * The role's purpose
   */
  readonly description: string

  /**
   * The role colour
   */
  readonly color: string

  /**
   * The role rank
   */
  readonly rank: number

  /**
   * Whether the role is built in
   */
  readonly builtIn: boolean

  /**
   * The role's permissions
   */
  readonly permissions: string[]
}

/**
 * A role being saved
 */
export type RoleInput = {
  /**
   * The role name
   */
  readonly name: string

  /**
   * The role's purpose
   */
  readonly description: string

  /**
   * The role colour
   */
  readonly color: string

  /**
   * The role rank
   */
  readonly rank: number

  /**
   * The role's permissions
   */
  readonly permissions: readonly string[]
}

/**
 * An account's role and overrides
 */
export type AccessState = {
  /**
   * The account's username
   */
  readonly username: string

  /**
   * The account's role, or null
   */
  readonly role: RoleView | null

  /**
   * The account's overrides
   */
  readonly overrides: {
    readonly permission: string
    readonly effect: OverrideEffect
  }[]
}

/**
 * Keeps roles and permissions
 * @class
 */
export class AccessRepository {
  /**
   * The database
   */
  private readonly database: Database

  /**
   * Creates the repository
   * @param database The database
   */
  public constructor(database: Database) {
    this.database = database
  }

  /**
   * Lists every permission
   * @returns The permissions
   */
  public async permissions(): Promise<PermissionRow[]> {
    return this.database.findMany(PermissionRow, { $sort: { position: 'asc' } })
  }

  /**
   * Lists every role
   * @returns The roles by rank
   */
  public async roles(): Promise<RoleView[]> {
    const roles = await this.database.findMany(Role, {
      $sort: { rank: 'desc' },
      $populate: { grants: true },
    })

    return roles.map((role) => AccessRepository.view(role))
  }

  /**
   * Finds a role
   * @param id The role id
   * @returns The role, or null
   */
  public async role(id: string): Promise<RoleView | null> {
    const role = await this.database.findOneById(Role, id, {
      $populate: { grants: true },
    })

    return role ? AccessRepository.view(role) : null
  }

  /**
   * Counts the accounts holding a role
   * @param roleId The role id
   * @returns The count
   */
  public async holders(roleId: string): Promise<number> {
    return this.database.count(RoleAssignment, { $where: { roleId } })
  }

  /**
   * Reads an account's role and overrides
   * @param accountId The account id
   * @returns The state, or null
   */
  public async stateOf(accountId: string): Promise<AccessState | null> {
    const account = await this.database.findOneById(Account, accountId)
    if (!account) return null

    const [assignment, overrides] = await Promise.all([
      this.database.findOneById(RoleAssignment, accountId),
      this.database.findMany(PermissionOverride, { $where: { accountId } }),
    ])

    return {
      username: account.username,
      role: assignment ? await this.role(assignment.roleId) : null,
      overrides: overrides.map(({ permission, effect }) => ({
        permission,
        effect,
      })),
    }
  }

  /**
   * Works out what an account may do
   * @param accountId The account id
   * @returns The actor
   */
  public async actorOf(accountId: string): Promise<Actor> {
    const state = await this.stateOf(accountId)

    return {
      rank: state?.role?.rank ?? 0,
      permissions: effectivePermissions(
        state?.role ?? null,
        state?.overrides ?? [],
      ),
    }
  }

  /**
   * Creates a role
   * @param input The role
   * @param actorId Who is creating it
   * @returns The role
   */
  public async createRole(
    input: RoleInput,
    actorId: string,
  ): Promise<RoleView> {
    const id = crypto.randomUUID()

    await this.database.transaction(async (querier) => {
      const { permissions, ...role } = input

      await querier.insertOne(Role, { id, ...role, createdBy: actorId })
      await AccessRepository.grant(querier, id, permissions, actorId)

      await writeAudit(querier, {
        actorId,
        action: 'role.created',
        targetKind: 'role',
        targetId: id,
        targetName: role.name,
        detail: { rank: role.rank, permissions },
      })
    })

    return this.found(id)
  }

  /**
   * Changes a role
   * @param id The role id
   * @param input The role
   * @param actorId Who is changing it
   * @returns The role
   */
  public async updateRole(
    id: string,
    input: RoleInput,
    actorId: string,
  ): Promise<RoleView> {
    await this.database.transaction(async (querier) => {
      const { permissions, ...role } = input

      await querier.updateOneById(Role, id, role)
      await querier.deleteMany(RoleGrant, { $where: { roleId: id } })
      await AccessRepository.grant(querier, id, permissions, actorId)

      await writeAudit(querier, {
        actorId,
        action: 'role.updated',
        targetKind: 'role',
        targetId: id,
        targetName: role.name,
        detail: { rank: role.rank, permissions },
      })
    })

    return this.found(id)
  }

  /**
   * Deletes a role
   * @param role The role
   * @param actorId Who is deleting it
   */
  public async deleteRole(role: RoleView, actorId: string): Promise<void> {
    await this.database.transaction(async (querier) => {
      await querier.deleteOneById(Role, role.id)

      await writeAudit(querier, {
        actorId,
        action: 'role.deleted',
        targetKind: 'role',
        targetId: role.id,
        targetName: role.name,
      })
    })
  }

  /**
   * Gives an account a role, or takes it away
   * @param accountId The account id
   * @param username The account's username
   * @param role The role, or null
   * @param actorId Who is changing it
   */
  public async assignRole(
    accountId: string,
    username: string,
    role: RoleView | null,
    actorId: string,
  ): Promise<void> {
    await this.database.transaction(async (querier) => {
      if (role) {
        await querier.upsertOne(
          RoleAssignment,
          { accountId: true },
          {
            accountId,
            roleId: role.id,
            grantedBy: actorId,
            grantedAt: new Date(),
          },
        )
      } else {
        await querier.deleteMany(RoleAssignment, { $where: { accountId } })
      }

      await writeAudit(querier, {
        actorId,
        action: 'member.role_changed',
        targetKind: 'account',
        targetId: accountId,
        targetName: username,
        detail: { roleId: role?.id ?? null, role: role?.name ?? null },
      })
    })
  }

  /**
   * Sets a permission override
   * @param accountId The account id
   * @param username The account's username
   * @param permission The permission
   * @param effect The effect, or null
   * @param actorId Who is changing it
   */
  public async setOverride(
    accountId: string,
    username: string,
    permission: string,
    effect: OverrideEffect | null,
    actorId: string,
  ): Promise<void> {
    await this.database.transaction(async (querier) => {
      if (effect) {
        await querier.upsertOne(
          PermissionOverride,
          { accountId: true, permission: true },
          {
            accountId,
            permission,
            effect,
            createdBy: actorId,
            createdAt: new Date(),
          },
        )
      } else {
        await querier.deleteMany(PermissionOverride, {
          $where: { accountId, permission },
        })
      }

      const action = effect ? OVERRIDE_ACTIONS[effect] : 'override.removed'

      await writeAudit(querier, {
        actorId,
        action,
        targetKind: 'account',
        targetId: accountId,
        targetName: username,
        detail: { permission },
      })
    })
  }

  /**
   * Finds a required role
   * @param id The role id
   * @returns The role
   */
  private async found(id: string): Promise<RoleView> {
    const role = await this.role(id)
    if (!role) throw new Error(`Role ${id} was not saved`)

    return role
  }

  /**
   * Gives a role its permissions
   * @param querier The querier
   * @param roleId The role id
   * @param permissions The permissions
   * @param actorId Who granted them
   */
  private static async grant(
    querier: SqlQuerier,
    roleId: string,
    permissions: readonly string[],
    actorId: string,
  ): Promise<void> {
    if (permissions.length === 0) return

    await querier.insertMany(
      RoleGrant,
      permissions.map((permission) => ({
        roleId,
        permission,
        grantedBy: actorId,
      })),
    )
  }

  /**
   * Turns a role into a view
   * @param role The role
   * @returns The view
   */
  private static view(role: Role): RoleView {
    return {
      id: role.id,
      key: role.key ?? null,
      name: role.name,
      description: role.description,
      color: role.color,
      rank: role.rank,
      builtIn: role.builtIn,
      permissions: (role.grants ?? []).map(({ permission }) => permission),
    }
  }
}
