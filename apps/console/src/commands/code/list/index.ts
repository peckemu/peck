import { CodeRepository, createDatabase } from '@peck/database'
import { Command, type Options } from '@peck/plugins'

/**
 * Lists the gift codes
 * @class
 */
export class CodeListCommand extends Command {
  /**
   * The command name
   */
  public readonly name = 'code:list'

  /**
   * The command description
   */
  public readonly description = 'Lists the gift codes'

  /**
   * The command options
   */
  public override readonly options = {
    database: { description: 'Database URL', env: 'DATABASE_URL' },
  }

  /**
   * Lists the codes
   * @param options The options
   */
  public async run(options: Options): Promise<void> {
    const database = createDatabase(String(options['database']))
    try {
      const codes = await new CodeRepository(database).list()
      if (codes.length === 0) console.log('No codes')

      for (const code of codes) {
        const limit =
          code.maxUses === null || code.maxUses === undefined
            ? 'unlimited'
            : String(code.maxUses)
        const expires = code.expiresAt ? code.expiresAt.toISOString() : 'never'

        console.log(
          `${code.code} gems ${String(code.gems)} diamonds ${String(code.diamonds)} days ${String(code.membershipDays)} items ${String(code.items.length)} used ${String(code.uses)} of ${limit} expires ${expires}`,
        )
      }
    } finally {
      await database.end()
    }
  }
}
