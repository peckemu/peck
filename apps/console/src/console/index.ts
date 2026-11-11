import { parseArgs } from 'node:util'

import { type Command, type Options } from '@peck/plugins'

/**
 * The command line console
 * @class
 */
export class Console {
  /**
   * The commands by name
   */
  private readonly commands: ReadonlyMap<string, Command>

  /**
   * Creates the console
   * @param commands The commands
   */
  public constructor(commands: readonly Command[]) {
    this.commands = new Map(commands.map((command) => [command.name, command]))
  }

  /**
   * Runs a command
   * @param args The command line arguments
   * @returns The exit code
   */
  public async run(args: readonly string[]): Promise<number> {
    const [name, ...rest] = args
    if (name === undefined || name === 'help' || name === '--help') {
      return this.help()
    }

    const command = this.commands.get(name)
    if (!command) {
      console.error(`Unknown command ${name}, run peck help to see them all`)
      return 1
    }
    if (rest.includes('--help')) return this.usage(command)

    try {
      await command.run(this.options(command, rest))
      return 0
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error))
      return 1
    }
  }

  /**
   * Reads a command's options
   * @param command The command
   * @param args The arguments
   * @returns The options
   */
  private options(command: Command, args: readonly string[]): Options {
    const { values } = parseArgs({
      args: [...args],
      options: Object.fromEntries(
        Object.entries(command.options).map(([name, option]) => [
          name,
          { type: option.flag ? ('boolean' as const) : ('string' as const) },
        ]),
      ),
      strict: true,
    })

    const options: Record<string, string | boolean | undefined> = { ...values }
    for (const [name, option] of Object.entries(command.options)) {
      if (option.flag || options[name] !== undefined) continue
      const env = option.env ? Bun.env[option.env] : undefined
      options[name] = env === undefined || env === '' ? option.fallback : env
      if (!option.optional) {
        options[name] ??= Console.ask(`${option.description}:`)
      }
    }
    return options
  }

  /**
   * Asks for a value
   * @param question The question
   * @returns The answer
   */
  private static ask(question: string): string {
    const answer = process.stdin.isTTY ? prompt(question)?.trim() : undefined
    if (!answer) {
      throw new Error(`Missing ${question.slice(0, -1).toLowerCase()}`)
    }
    return answer
  }

  /**
   * Lists every command
   * @returns The exit code
   */
  private help(): number {
    const width = Math.max(
      ...[...this.commands.keys()].map((name) => name.length),
    )
    console.log('Usage: peck <command> [options]\n')
    for (const command of this.commands.values()) {
      console.log(`  ${command.name.padEnd(width)}  ${command.description}`)
    }
    return 0
  }

  /**
   * Shows a command's usage
   * @param command The command
   * @returns The exit code
   */
  private usage(command: Command): number {
    console.log(
      `Usage: peck ${command.name} [options]\n\n${command.description}\n`,
    )
    const width = Math.max(
      0,
      ...Object.keys(command.options).map((name) => name.length + 2),
    )
    for (const [name, option] of Object.entries(command.options)) {
      const env = option.env ? ` (or ${option.env})` : ''
      console.log(`  ${`--${name}`.padEnd(width)}  ${option.description}${env}`)
    }
    return 0
  }
}
