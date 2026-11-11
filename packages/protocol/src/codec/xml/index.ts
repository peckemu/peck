import { type FieldNode } from '#protocol/codec/field'
import {
  type FieldPath,
  FormatCodec,
  type WriteTarget,
} from '#protocol/codec/format'
import { type XmlElement, XmlPath } from '#protocol/codec/path'
import { type Schema } from '#protocol/codec/schema'
import { XmlMessage } from '#protocol/wire/xml/message'
import { XML_CDATA, XML_TEXT_NODE, type XmlNode } from '#protocol/wire/xml/node'

/**
 * Reads and writes fields inside the body
 * @class
 */
export class XmlCodec extends FormatCodec<XmlMessage> {
  /**
   * The packet format this codec handles
   */
  public readonly format = 'xml'

  /**
   * Reads a client message's fields
   * @param message The message to read
   * @param schema The message schema
   * @returns The message fields
   */
  public read(message: XmlMessage, schema: Schema): Record<string, unknown> {
    const values: Record<string, unknown> = {}
    for (const { key, node } of schema.fields) {
      const at = { header: message.header, label: key }
      values[key] = this.readNode(node, key, message.body, at, message)
    }
    return values
  }

  /**
   * Writes a frame
   * @param target The target
   * @returns The message as text
   */
  public write({ header, room, handler, schema, source }: WriteTarget): string {
    const body: XmlElement = {}
    for (const { key, node } of schema.fields) {
      const value = (source as Record<string, unknown>)[key]
      this.writeNode(node, key, value, body, { header, label: key })
    }
    return XmlMessage.build(header, room, body, handler)
  }

  /**
   * Checks whether XML can carry a node
   * @param node The node to check
   * @returns Whether XML can carry the node
   */
  protected supports(node: FieldNode): boolean {
    if (node.options.path !== undefined) XmlPath.of(node.options.path)
    return (
      node.kind !== 'rest' && node.kind !== 'array' && node.kind !== 'record'
    )
  }

  /**
   * Reads a field below an element
   * @param node The shape of the value
   * @param key The field's name
   * @param element The element to read below
   * @param at Where the value sits
   * @param message The message being read
   * @returns The value read
   */
  private readNode(
    node: FieldNode,
    key: string,
    element: XmlNode,
    at: FieldPath,
    message: XmlMessage | null,
  ): unknown {
    const path = XmlPath.of(node.options.path ?? key)
    switch (node.kind) {
      case 'message':
        if (!message) {
          throw new TypeError(`${at.header}: ${at.label} is not available here`)
        }
        return message[node.key]
      case 'list': {
        const { parent, name } = XmlCodec.repeated(path, at)
        return (path.element(element, parent)?.children(name) ?? []).map(
          (child, index) =>
            this.readItem(node.item, child, FormatCodec.child(at, index)),
        )
      }
      case 'object': {
        const child = path.element(element)
        if (!child) throw this.fail(at, 'is missing')
        return this.readItem(node, child, at)
      }
      case 'optional':
        return this.present(node.item, path, element)
          ? this.readNode(node.item, key, element, at, message)
          : undefined
      case 'map':
        return this.mapped(
          node,
          this.readNode(node.item, key, element, at, message),
          at,
        )
      case 'split': {
        const text = this.text(path, element, at)
        return (text === '' ? [] : text.split(node.separator)).map(
          (part, index) =>
            this.fromText(node.item, part, FormatCodec.child(at, index)),
        )
      }
      default:
        return this.fromText(node, this.text(path, element, at), at)
    }
  }

  /**
   * Reads one element of a list
   * @param node The shape of the value
   * @param element The element to read
   * @param at Where the value sits
   * @returns The value read
   */
  private readItem(node: FieldNode, element: XmlNode, at: FieldPath): unknown {
    if (node.kind !== 'object') return this.fromText(node, element.text, at)
    const value: Record<string, unknown> = {}
    for (const [key, child] of node.shape) {
      value[key] = this.readNode(
        child,
        key,
        element,
        FormatCodec.child(at, key),
        null,
      )
    }
    return value
  }

  /**
   * Writes a field's value below an element
   * @param node The shape of the value
   * @param key The field's name
   * @param raw The value to write
   * @param target The element to write below
   * @param at Where the value sits
   */
  private writeNode(
    node: FieldNode,
    key: string,
    raw: unknown,
    target: XmlElement,
    at: FieldPath,
  ): void {
    if (node.kind === 'message') {
      throw new TypeError(`${at.header}: ${at.label} is read only`)
    }
    const value = this.valueOf(node, raw, at)
    const path = XmlPath.of(node.options.path ?? key)
    switch (node.kind) {
      case 'list': {
        const { parent, name } = XmlCodec.repeated(path, at)
        XmlPath.open(target, parent)[name] = (value as readonly unknown[]).map(
          (item, index) =>
            this.writeItem(node.item, item, FormatCodec.child(at, index)),
        )
        return
      }
      case 'object':
        Object.assign(
          XmlPath.open(target, path.elements),
          this.writeItem(node, value, at),
        )
        return
      case 'optional':
        if (value !== undefined) {
          this.writeNode(node.item, key, value, target, at)
        }
        return
      case 'map':
        this.writeNode(
          node.item,
          key,
          this.unmapped(node, value, at),
          target,
          at,
        )
        return
      case 'split': {
        const parts = (value as readonly unknown[]).map((item, index) =>
          this.toText(node.item, item, FormatCodec.child(at, index)),
        )
        path.write(
          target,
          parts.join(node.separator),
          node.options.cdata ?? false,
        )
        return
      }
      default:
        path.write(
          target,
          this.toText(node, value, at),
          node.options.cdata ?? false,
        )
    }
  }

  /**
   * Writes one element of a list
   * @param node The shape of the value
   * @param value The value to write
   * @param at Where the value sits
   * @returns The written element
   */
  private writeItem(
    node: FieldNode,
    value: unknown,
    at: FieldPath,
  ): XmlElement {
    if (node.kind !== 'object') {
      return {
        [node.options.cdata ? XML_CDATA : XML_TEXT_NODE]: this.toText(
          node,
          value,
          at,
        ),
      }
    }
    const element: XmlElement = {}
    for (const [key, child] of node.shape) {
      const item = (value as Record<string, unknown>)[key]
      this.writeNode(child, key, item, element, FormatCodec.child(at, key))
    }
    return element
  }

  /**
   * Reads the text at a path
   * @param path The path to read
   * @param element The element to read below
   * @param at Where the value sits
   * @returns The text at the path
   */
  private text(path: XmlPath, element: XmlNode, at: FieldPath): string {
    const text = path.read(element)
    if (text === null) throw this.fail(at, 'is missing')
    return text
  }

  /**
   * Checks an optional field is set
   * @param node The shape of the value
   * @param path The path of the value
   * @param element The element to read below
   * @returns Whether the value is present
   */
  private present(node: FieldNode, path: XmlPath, element: XmlNode): boolean {
    const inner = node.kind === 'map' ? node.item : node
    if (inner.kind === 'list' || inner.kind === 'message') return true
    if (inner.kind === 'object') return path.element(element) !== null
    return path.read(element) !== null
  }

  /**
   * Splits a list path
   * @param path The list's path
   * @param at Where the value sits
   * @returns The parents and the repeated element
   */
  private static repeated(
    path: XmlPath,
    at: FieldPath,
  ): { parent: readonly string[]; name: string } {
    const name = path.elements.at(-1)
    if (path.attribute !== null || name === undefined) {
      throw new TypeError(
        `${at.header}: ${at.label} path must end at an element`,
      )
    }
    return { parent: path.elements.slice(0, -1), name }
  }
}
