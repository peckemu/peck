/**
 * An option a command takes
 */
export type Option = {
  /**
   * The option description
   */
  readonly description: string

  /**
   * The env fallback
   */
  readonly env?: string

  /**
   * The default value
   */
  readonly fallback?: string

  /**
   * Whether it is a flag
   */
  readonly flag?: boolean

  /**
   * Whether it is optional
   */
  readonly optional?: boolean
}

/**
 * A command's options
 */
export type Options = Readonly<Record<string, string | boolean | undefined>>

/**
 * A console command
 * @class
 */
export abstract class Command {
  /**
   * The command name
   */
  public abstract readonly name: string

  /**
   * The command description
   */
  public abstract readonly description: string

  /**
   * The command options
   */
  public readonly options: Readonly<Record<string, Option>> = {}

  /**
   * Runs the command
   * @param options The options
   */
  public abstract run(options: Options): Promise<void>
}
