/**
 * The XML entities
 */
const NAMED: Readonly<Record<string, string>> = {
  lt: '<',
  gt: '>',
  amp: '&',
  apos: "'",
  quot: '"',
}

/**
 * Decodes XML entities
 * @class
 */
export class XmlEntities {
  /**
   * Decodes the named entities in a string
   * @param text The text to decode
   * @returns The decoded text
   */
  public static decode(text: string): string {
    if (!text.includes('&')) return text
    let result = ''
    let index = 0
    while (index < text.length) {
      const ampersand = text.indexOf('&', index)
      if (ampersand === -1) break
      const semicolon = text.indexOf(';', ampersand + 1)
      result += text.slice(index, ampersand)
      const name =
        semicolon === -1 ? undefined : text.slice(ampersand + 1, semicolon)
      const character = name === undefined ? undefined : NAMED[name]
      if (character === undefined) {
        result += '&'
        index = ampersand + 1
      } else {
        result += character
        index = semicolon + 1
      }
    }
    return result + text.slice(index)
  }
}
