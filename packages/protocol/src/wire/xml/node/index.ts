/**
 * The attribute prefix
 */
export const XML_ATTRIBUTE_PREFIX = '@'

/**
 * The text key
 */
export const XML_TEXT_NODE = '#text'

/**
 * The CDATA key
 */
export const XML_CDATA = '#cdata'

/**
 * A parsed XML element
 * @class
 */
export class XmlNode {
  /**
   * The name of the element
   */
  public readonly name: string

  /**
   * The element's raw value
   */
  private readonly value: unknown

  /**
   * Creates a new XML node
   * @param name The name of the element
   * @param value The element's raw value
   */
  public constructor(name: string, value: unknown) {
    this.name = name
    this.value = value
  }

  /**
   * Retrieves an attribute of the element
   * @param name The name of the attribute
   * @returns The attribute's value
   */
  public attribute(name: string): string | null {
    const value = this.record?.[XML_ATTRIBUTE_PREFIX + name]
    return typeof value === 'string' ? value : null
  }

  /**
   * Retrieves a named child element
   * @param name The name of the child element
   * @returns The child element
   */
  public child(name: string): XmlNode | null {
    return this.children(name)[0] ?? null
  }

  /**
   * Retrieves named child elements
   * @param name The name of the child elements
   * @returns The child elements
   */
  public children(name: string): XmlNode[] {
    const value = this.record?.[name]
    if (value === undefined) return []
    return (Array.isArray(value) ? value : [value]).map(
      (item: unknown) => new XmlNode(name, item),
    )
  }

  /**
   * The element's text
   */
  public get text(): string {
    if (typeof this.value === 'string') return this.value
    const text = this.record?.[XML_TEXT_NODE]
    return typeof text === 'string' ? text : ''
  }

  /**
   * The element as a record
   */
  private get record(): Record<string, unknown> | null {
    return typeof this.value === 'object' && this.value !== null
      ? (this.value as Record<string, unknown>)
      : null
  }
}
