import { createDatabase, ReferralRepository } from '@peck/database'
import { Command, type Options } from '@peck/plugins'

/**
 * The last treasure
 */
const LAST_LEVEL = 4

/**
 * Sets up a referral treasure
 * @class
 */
export class ReferralLevelCommand extends Command {
  /**
   * The command name
   */
  public readonly name = 'referral:level'

  /**
   * The command description
   */
  public readonly description = 'Sets up a referral treasure'

  /**
   * The command options
   */
  public override readonly options = {
    database: { description: 'Database URL', env: 'DATABASE_URL' },
    level: { description: 'The treasure, from 1 to 4' },
    referrals: { description: 'The referrals it takes' },
    code: { description: 'The code whose rewards it gives', optional: true },
  }

  /**
   * Sets up the treasure
   * @param options The options
   */
  public async run(options: Options): Promise<void> {
    const level = Number(options['level'])
    const referrals = Number(options['referrals'])
    if (!Number.isInteger(level) || level < 1 || level > LAST_LEVEL) {
      throw new Error('Level is out of range')
    }
    if (!Number.isSafeInteger(referrals) || referrals < 1) {
      throw new Error('Referrals is not a whole number')
    }

    const code = typeof options['code'] === 'string' ? options['code'] : null

    const database = createDatabase(String(options['database']))
    try {
      await new ReferralRepository(database).setLevel(level, referrals, code)

      console.log(`Treasure ${String(level)} takes ${String(referrals)}`)
    } finally {
      await database.end()
    }
  }
}
