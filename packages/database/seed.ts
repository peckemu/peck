import { createDatabase } from '#database/pool'
import { Seeder } from '#database/seeder'
import { SEEDS } from '#database/seeds'

const url = process.env['DATABASE_URL']
if (url === undefined) throw new Error('Missing DATABASE_URL')
const production = process.env.NODE_ENV === 'production'

const database = createDatabase(url)
try {
  const names = await new Seeder(database, SEEDS).run(
    process.argv.slice(2),
    production,
  )
  console.log(`Seeded ${names.join(', ')}`)
} finally {
  await database.end()
}
