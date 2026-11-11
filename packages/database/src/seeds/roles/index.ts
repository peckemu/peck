import { ROLE_KEYS, ROLES } from '@peck/permissions'
import { type SqlQuerier } from 'uql-orm'

import { RoleGrant } from '#database/entities/access/grant'
import { Role } from '#database/entities/access/role'
import { Seed } from '#database/seeder'

/**
 * Seeds the Peck roles
 * @class
 */
export class RolesSeed extends Seed {
  /**
   * The seed name
   */
  public readonly name = 'roles'

  /**
   * Whether the seed runs in production
   */
  public override readonly production = true

  /**
   * Writes every role and its permissions
   * @param querier The querier
   */
  public async run(querier: SqlQuerier): Promise<void> {
    for (const key of ROLE_KEYS) {
      const { permissions, ...role } = ROLES[key]

      await querier.upsertOne(
        Role,
        { key: true },
        { key, ...role, builtIn: true },
      )

      const saved = await querier.findOne(Role, { $where: { key } })
      if (!saved) throw new Error(`Role ${key} was not saved`)

      await querier.deleteMany(RoleGrant, { $where: { roleId: saved.id } })
      await querier.insertMany(
        RoleGrant,
        permissions.map((permission) => ({ roleId: saved.id, permission })),
      )
    }
  }
}
