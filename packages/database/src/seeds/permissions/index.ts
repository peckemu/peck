import { PERMISSION_KEYS, PERMISSIONS } from '@peck/permissions'
import { type SqlQuerier } from 'uql-orm'

import { PermissionRow } from '#database/entities/access/permission'
import { Seed } from '#database/seeder'

/**
 * Seeds the permissions
 * @class
 */
export class PermissionsSeed extends Seed {
  /**
   * The seed name
   */
  public readonly name = 'permissions'

  /**
   * Whether the seed runs in production
   */
  public override readonly production = true

  /**
   * Writes every permission
   * @param querier The querier
   */
  public async run(querier: SqlQuerier): Promise<void> {
    const rows = PERMISSION_KEYS.map((key, index) => ({
      key,
      ...PERMISSIONS[key],
      position: index + 1,
    }))

    await querier.upsertMany(PermissionRow, { key: true }, rows)
  }
}
