/**
 * Matches a plain decimal integer
 */
const INTEGER = /^-?\d+$/

/**
 * Matches a plain decimal number
 */
const NUMBER = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/

/**
 * Strict number parsing
 * @class
 */
export class Numbers {
  /**
   * Parses a decimal integer
   * @param text The text to parse
   * @returns The integer, or null
   */
  public static integer(text: string): number | null {
    const value = Number(text)
    return INTEGER.test(text) && Number.isSafeInteger(value) ? value : null
  }

  /**
   * Parses a finite decimal number
   * @param text The text to parse
   * @returns The number, or null
   */
  public static decimal(text: string): number | null {
    const value = Number(text)
    return NUMBER.test(text) && Number.isFinite(value) ? value : null
  }
}
