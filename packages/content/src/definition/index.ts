import { type AmfObject, type AmfValue } from '#content/amf'

/**
 * A definition in a pack
 * @class
 */
export class Definition {
  /**
   * The definition's fields
   */
  private readonly fields: AmfObject

  /**
   * Creates a definition
   * @param fields The definition's fields
   */
  public constructor(fields: AmfObject) {
    this.fields = fields
  }

  /**
   * Reads a number
   * @param key The field
   * @returns The number
   */
  public number(key: string): number {
    const value: AmfValue = this.fields[key]
    if (typeof value === 'number') return value
    if (typeof value === 'boolean') return value ? 1 : 0
    if (value === null) return 0
    if (typeof value === 'string') {
      return value.trim() === '' ? 0 : Number(value.trim())
    }
    return Number.NaN
  }

  /**
   * Reads an int
   * @param key The field
   * @returns The number
   */
  public int(key: string): number {
    const number = this.number(key)
    return Number.isFinite(number) ? Math.trunc(number) | 0 : 0
  }

  /**
   * Reads a uint
   * @param key The field
   * @returns The number
   */
  public uint(key: string): number {
    const number = this.number(key)
    return Number.isFinite(number) ? Math.trunc(number) >>> 0 : 0
  }

  /**
   * Reads text
   * @param key The field
   * @returns The text
   */
  public text(key: string): string {
    const value: AmfValue = this.fields[key]
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
    return ''
  }

  /**
   * Reads a flag
   * @param key The field
   * @returns Whether it is set
   */
  public flag(key: string): boolean {
    const value: AmfValue = this.fields[key]
    return value === '1' || value === 1 || value === true
  }

  /**
   * Reads a list of numbers
   * @param key The field
   * @returns The numbers
   */
  public uints(key: string): number[] {
    const text = this.text(key)
    if (text === '') return []
    return text.split(',').map((each) => new Definition({ each }).uint('each'))
  }

  /**
   * Reads a time
   * @param key The field
   * @returns The time, or null
   */
  public time(key: string): number | null {
    const seconds = this.uint(key)
    return seconds === 0 ? null : seconds
  }
}
