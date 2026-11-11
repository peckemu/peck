import { createDatabase, EcoRepository } from '@peck/database'
import { Command, type Options } from '@peck/plugins'

/**
 * The highest gift bit
 */
const HIGHEST_BIT = 30

/**
 * Adds or changes an eco gift
 * @class
 */
export class EcoGiftCommand extends Command {
  /**
   * The command name
   */
  public readonly name = 'eco:gift'

  /**
   * The command description
   */
  public readonly description = 'Adds or changes an eco gift'

  /**
   * The command options
   */
  public override readonly options = {
    database: { description: 'Database URL', env: 'DATABASE_URL' },
    bit: { description: "The gift's bit" },
    score: { description: 'The eco score needed' },
    item: { description: 'The den item definition id' },
    color: { description: "The item's colour", optional: true },
    name: { description: "The prize's name string", optional: true },
    desc: { description: "The prize's description string", optional: true },
  }

  /**
   * Keeps the gift
   * @param options The options
   */
  public async run(options: Options): Promise<void> {
    const gift = {
      bitIdx: EcoGiftCommand.number(options['bit']),
      scoreRequired: EcoGiftCommand.number(options['score']),
      denItemDefId: EcoGiftCommand.number(options['item']),
      color: EcoGiftCommand.number(options['color'] ?? '0'),
      nameStrId: EcoGiftCommand.number(options['name'] ?? '0'),
      descStrId: EcoGiftCommand.number(options['desc'] ?? '0'),
    }
    if (gift.bitIdx > HIGHEST_BIT) throw new Error('Bit is too high')
    if (gift.denItemDefId <= 0) throw new Error('No den item')

    const database = createDatabase(String(options['database']))
    try {
      await new EcoRepository(database).keepGift(gift)

      console.log(`Kept eco gift ${String(gift.bitIdx)}`)
    } finally {
      await database.end()
    }
  }

  /**
   * Reads a whole number option
   * @param value The option
   * @returns The number
   */
  private static number(value: string | boolean | undefined): number {
    const parsed = Number(value)
    if (!Number.isSafeInteger(parsed) || parsed < 0) {
      throw new Error('Not a whole number')
    }

    return parsed
  }
}
