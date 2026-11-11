import { ProtocolError } from '#protocol/error'

/**
 * The XT separator
 */
const SEPARATOR = '%'

/**
 * Collects XT arguments in order
 * @class
 */
export class XtWriter {
  /**
   * The written packet's header
   */
  public readonly header: string

  /**
   * The arguments written
   */
  private readonly args: string[] = []

  /**
   * Creates a new XT writer
   * @param header The header of the packet being written
   */
  public constructor(header = 'xt') {
    this.header = header
  }

  /**
   * The values written
   */
  public get values(): readonly string[] {
    return this.args
  }

  /**
   * Writes a string
   * @param value The string to write
   * @returns The writer
   */
  public string(value: string): this {
    if (value.includes(SEPARATOR)) {
      throw new ProtocolError(
        `${this.header}: value contains ${SEPARATOR}`,
        'XT_VALUE',
      )
    }
    this.args.push(value)
    return this
  }

  /**
   * Writes an integer
   * @param value The integer to write
   * @returns The writer
   */
  public int(value: number): this {
    if (!Number.isInteger(value)) {
      throw new RangeError(`${this.header}: ${value} is not an integer`)
    }
    return this.string(String(value))
  }

  /**
   * Writes a finite number
   * @param value The number to write
   * @returns The writer
   */
  public number(value: number): this {
    if (!Number.isFinite(value)) {
      throw new RangeError(`${this.header}: ${value} is not a number`)
    }
    return this.string(String(value))
  }

  /**
   * Writes a flag as 1 or 0
   * @param value The boolean to write
   * @returns The writer
   */
  public boolean(value: boolean): this {
    return this.string(value ? '1' : '0')
  }
}
