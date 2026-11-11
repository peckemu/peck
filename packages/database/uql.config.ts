import { type Config } from 'uql-orm'

import { ENTITIES } from '#database/entities'
import { createDatabase } from '#database/pool'

const url = process.env['DATABASE_URL']
if (url === undefined) throw new Error('Missing DATABASE_URL')

export default {
  pool: createDatabase(url) as unknown as Config['pool'],
  entities: ENTITIES,
  migrationsPath: './migrations',
} satisfies Config
