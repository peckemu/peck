import { type CodeItem, CodeRepository, createDatabase } from '@peck/database'
import { Command, type Options } from '@peck/plugins'

/**
 * Makes a gift code
 * @class
 */
export class CodeCreateCommand extends Command {
  /**
   * The command name
   */
  public readonly name = 'code:create'

  /**
   * The command description
   */
  public readonly description = 'Makes a gift code'

  /**
   * The command options
   */
  public override readonly options = {
    database: { description: 'Database URL', env: 'DATABASE_URL' },
    code: { description: 'The code' },
    gems: { description: 'The gems it gives', optional: true },
    diamonds: { description: 'The diamonds it gives', optional: true },
    days: { description: 'The membership days it gives', optional: true },
    clothing: {
      description: 'The clothing it gives, as defId:color, comma separated',
      optional: true,
    },
    denitems: {
      description: 'The den items it gives, comma separated',
      optional: true,
    },
    uses: { description: 'How many times it can be used', optional: true },
    expires: { description: 'When it stops working', optional: true },
    verified: { description: 'Needs a confirmed email', flag: true },
  }

  /**
   * Makes the code
   * @param options The options
   */
  public async run(options: Options): Promise<void> {
    const code = String(options['code'])
    const items = [
      ...CodeCreateCommand.clothing(options['clothing']),
      ...CodeCreateCommand.denItems(options['denitems']),
    ]
    const expires =
      typeof options['expires'] === 'string'
        ? new Date(options['expires'])
        : null
    if (expires && Number.isNaN(expires.getTime())) {
      throw new Error('Expiry is not a date')
    }

    const reward = {
      gems: CodeCreateCommand.count(options['gems']),
      diamonds: CodeCreateCommand.count(options['diamonds']),
      membershipDays: CodeCreateCommand.count(options['days']),
    }
    const maxUses =
      typeof options['uses'] === 'string'
        ? CodeCreateCommand.count(options['uses'])
        : null

    const database = createDatabase(String(options['database']))
    try {
      const made = await new CodeRepository(database).create({
        code,
        ...reward,
        items,
        maxUses,
        expiresAt: expires,
        verifiedOnly: options['verified'] === true,
      })
      if (!made) throw new Error('Code already exists')

      console.log(`Made code ${CodeRepository.normal(code)}`)
    } finally {
      await database.end()
    }
  }

  /**
   * Reads a count
   * @param value The option
   * @returns The count
   */
  private static count(value: string | boolean | undefined): number {
    if (typeof value !== 'string') return 0

    const count = Number(value)
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new Error('Count is not a whole number')
    }

    return count
  }

  /**
   * Reads the clothing
   * @param value The option
   * @returns The clothing
   */
  private static clothing(value: string | boolean | undefined): CodeItem[] {
    if (typeof value !== 'string' || value === '') return []

    return value.split(',').map((entry): CodeItem => {
      const [defId = '', color = '0'] = entry.split(':')

      return {
        kind: 'clothing',
        defId: CodeCreateCommand.count(defId),
        color: CodeCreateCommand.count(color),
      }
    })
  }

  /**
   * Reads the den items
   * @param value The option
   * @returns The den items
   */
  private static denItems(value: string | boolean | undefined): CodeItem[] {
    if (typeof value !== 'string' || value === '') return []

    return value.split(',').map((defId): CodeItem => ({
      kind: 'den-item',
      defId: CodeCreateCommand.count(defId),
      color: 0,
    }))
  }
}
