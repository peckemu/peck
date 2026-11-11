import {
  XML_ATTRIBUTE_PREFIX,
  XML_CDATA,
  XML_TEXT_NODE,
  type XmlNode,
} from '#protocol/wire/xml/node'

/**
 * A builder element
 */
export type XmlElement = Record<string, unknown>

/**
 * Checks for a plain object
 */
const isRecord = (value: unknown): value is XmlElement =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Where a value sits below an element
 * @class
 */
export class XmlPath {
  /**
   * The paths already parsed
   */
  private static readonly cache = new Map<string, XmlPath>()

  /**
   * The path as written
   */
  public readonly text: string

  /**
   * The element names
   */
  public readonly elements: readonly string[]

  /**
   * The attribute named last
   */
  public readonly attribute: string | null

  /**
   * Creates a new XML path
   * @param text The path as written
   */
  public constructor(text: string) {
    const parts = text.split('/')
    const last = parts.at(-1) ?? ''
    if (
      parts.some((part) => part === '') ||
      parts.slice(0, -1).some((part) => part.startsWith('@'))
    ) {
      throw new TypeError(`Invalid XML path ${text}`)
    }
    this.text = text
    this.attribute = last.startsWith('@') ? last.slice(1) : null
    this.elements = this.attribute === null ? parts : parts.slice(0, -1)
  }

  /**
   * Retrieves the path for some text
   * @param text The path as written
   * @returns The parsed path
   */
  public static of(text: string): XmlPath {
    let path = XmlPath.cache.get(text)
    if (!path) {
      path = new XmlPath(text)
      XmlPath.cache.set(text, path)
    }
    return path
  }

  /**
   * Walks to the path's element
   * @param node The starting element
   * @param elements The element names
   * @returns The element, or null
   */
  public element(node: XmlNode, elements = this.elements): XmlNode | null {
    let current: XmlNode | null = node
    for (const name of elements) current = current?.child(name) ?? null
    return current
  }

  /**
   * Reads a path's value
   * @param node The starting element
   * @returns The value, or null
   */
  public read(node: XmlNode): string | null {
    const element = this.element(node)
    if (!element) return null
    return this.attribute === null
      ? element.text
      : element.attribute(this.attribute)
  }

  /**
   * Writes a value at a path
   * @param target The starting element
   * @param value The value to write
   * @param cdata Whether to write the text as CDATA
   */
  public write(target: XmlElement, value: string, cdata: boolean): void {
    const element = XmlPath.open(target, this.elements)
    if (this.attribute === null) {
      element[cdata ? XML_CDATA : XML_TEXT_NODE] = value
    } else element[XML_ATTRIBUTE_PREFIX + this.attribute] = value
  }

  /**
   * Walks to an element below a target
   * @param target The starting element
   * @param elements The element names
   * @returns The element at the end
   */
  public static open(
    target: XmlElement,
    elements: readonly string[],
  ): XmlElement {
    let current = target
    for (const name of elements) {
      const existing = current[name]
      const next = isRecord(existing) ? existing : {}
      current[name] = next
      current = next
    }
    return current
  }
}
