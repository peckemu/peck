import { ProtocolError } from '#protocol/error'
import { Numbers } from '#protocol/wire/numbers'

/**
 * Reads XT arguments in order
 * @class
 */
export class XtReader {
  /**
   * The read packet's header
   */
  public readonly header: string

  /**
   * The arguments to read
   */
  private readonly args: readonly string[]

  /**
   * The next argument's index
   */
  private cursor = 0

  /**
   * Creates a new XT reader
   * @param header The header of the packet being read
   * @param args The arguments to read
   */
  public constructor(header: string, args: readonly string[]) {
    this.header = header
    this.args = args
  }

  /**
   * The unread argument count
   */
  public get remaining(): number {
    return this.args.length - this.cursor
  }

  /**
   * Reads a string
   * @param field The name of the field
   * @returns The string
   */
  public string(field = 'value'): string {
    return this.next(field)
  }

  /**
   * Reads a decimal integer
   * @param field The name of the field
   * @returns The integer
   */
  public int(field = 'value'): number {
    const text = this.next(field)
    const value = Numbers.integer(text)
    if (value === null) throw this.fail(field, 'is not an integer')
    return value
  }

  /**
   * Reads a finite decimal number
   * @param field The name of the field
   * @returns The number
   */
  public number(field = 'value'): number {
    const text = this.next(field)
    const value = Numbers.decimal(text)
    if (value === null) throw this.fail(field, 'is not a number')
    return value
  }

  /**
   * Reads a flag written as 1 or 0
   * @param field The name of the field
   * @returns The flag
   */
  public boolean(field = 'value'): boolean {
    return this.next(field) !== '0'
  }

  /**
   * Reads how many items follow
   * @param field The name of the field
   * @returns The count
   */
  public count(field = 'count'): number {
    const count = this.int(field)
    if (count < 0 || count > this.remaining) {
      throw this.fail(field, 'is out of range')
    }
    return count
  }

  /**
   * Reads every argument left
   * @returns The arguments not yet read
   */
  public rest(): string[] {
    const rest = this.args.slice(this.cursor)
    this.cursor = this.args.length
    return rest
  }

  /**
   * Creates an error for a bad field
   * @param field The name of the field
   * @param problem The problem
   * @returns The protocol error
   */
  private fail(field: string, problem: string): ProtocolError {
    return ProtocolError.field(this.header, field, problem)
  }

  /**
   * Reads the next argument
   * @param field The name of the field
   * @returns The next argument
   */
  private next(field: string): string {
    const value = this.args[this.cursor]
    if (value === undefined) throw this.fail(field, 'is missing')
    this.cursor++
    return value
  }
}
