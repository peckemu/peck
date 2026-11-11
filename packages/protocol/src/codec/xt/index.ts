import { type FieldNode } from '#protocol/codec/field'
import {
  type FieldPath,
  FormatCodec,
  type WriteTarget,
} from '#protocol/codec/format'
import { type Schema } from '#protocol/codec/schema'
import { ProtocolError } from '#protocol/error'
import { XtMessage } from '#protocol/wire/xt/message'
import { XtReader } from '#protocol/wire/xt/reader'
import { XtWriter } from '#protocol/wire/xt/writer'

/**
 * Reads and writes fields as XT arguments
 * @class
 */
export class XtCodec extends FormatCodec<XtMessage> {
  /**
   * The packet format this codec handles
   */
  public readonly format = 'xt'

  /**
   * Reads a message's fields
   * @param message The message to read
   * @param schema The message schema
   * @returns The message fields
   */
  public read(message: XtMessage, schema: Schema): Record<string, unknown> {
    const reader = new XtReader(message.header, message.args)
    const values: Record<string, unknown> = {}
    for (const { key, node } of schema.fields) {
      values[key] = this.readNode(node, reader, {
        header: message.header,
        label: key,
      })
    }
    return values
  }

  /**
   * Writes a frame
   * @param target The target
   * @returns The message as text
   */
  public write({ header, room, schema, source }: WriteTarget): string {
    const writer = new XtWriter(header)
    for (const { key, node } of schema.fields) {
      this.writeNode(node, (source as Record<string, unknown>)[key], writer, {
        header,
        label: key,
      })
    }
    return XtMessage.build(header, room, writer.values)
  }

  /**
   * Checks whether XT can carry a node
   * @param node The node to check
   * @returns Whether XT can carry the node
   */
  protected supports(node: FieldNode): boolean {
    return node.kind !== 'record' && node.kind !== 'message'
  }

  /**
   * Reads a field from the arguments
   * @param node The shape of the value
   * @param reader The reader over the arguments
   * @param at Where the value sits
   * @returns The value read
   */
  private readNode(node: FieldNode, reader: XtReader, at: FieldPath): unknown {
    switch (node.kind) {
      case 'list': {
        const count = reader.count(`${at.label}.length`)
        return this.readItems(
          node.item,
          reader,
          at,
          () => reader.remaining > 0,
          count,
        )
      }
      case 'array':
        return this.readItems(node.item, reader, at, () => true, node.length)
      case 'rest':
        return this.readItems(node.item, reader, at, () => reader.remaining > 0)
      case 'split': {
        const text = reader.string(at.label)
        const parts = new XtReader(
          at.header,
          text === '' ? [] : text.split(node.separator),
        )
        return this.readItems(node.item, parts, at, () => parts.remaining > 0)
      }
      case 'object': {
        const value: Record<string, unknown> = {}
        for (const [key, child] of node.shape) {
          value[key] = this.readNode(child, reader, FormatCodec.child(at, key))
        }
        return value
      }
      case 'optional':
        return reader.remaining > 0
          ? this.readNode(node.item, reader, at)
          : undefined
      case 'map':
        return this.mapped(node, this.readNode(node.item, reader, at), at)
      default:
        return this.fromText(node, reader.string(at.label), at)
    }
  }

  /**
   * Reads a number of items
   * @param item The item shape
   * @param reader The reader over the arguments
   * @param at Where the list sits
   * @param more Whether more items follow
   * @param count The number of items to read
   * @returns The items read
   */
  private readItems(
    item: FieldNode,
    reader: XtReader,
    at: FieldPath,
    more: () => boolean,
    count = Infinity,
  ): unknown[] {
    const items: unknown[] = []
    while (items.length < count && (count !== Infinity || more())) {
      items.push(
        this.readNode(item, reader, FormatCodec.child(at, items.length)),
      )
    }
    return items
  }

  /**
   * Writes a field as arguments
   * @param node The shape of the value
   * @param raw The value to write
   * @param writer The writer to add the arguments to
   * @param at Where the value sits
   */
  private writeNode(
    node: FieldNode,
    raw: unknown,
    writer: XtWriter,
    at: FieldPath,
  ): void {
    const value = this.valueOf(node, raw, at)
    switch (node.kind) {
      case 'list':
        writer.int((value as readonly unknown[]).length)
        this.writeItems(node.item, value, writer, at)
        return
      case 'array':
        if ((value as readonly unknown[]).length !== node.length) {
          throw new RangeError(
            `${at.header}: ${at.label} must have ${node.length} items`,
          )
        }
        this.writeItems(node.item, value, writer, at)
        return
      case 'rest':
        this.writeItems(node.item, value, writer, at)
        return
      case 'split': {
        const parts = new XtWriter(at.header)
        this.writeItems(node.item, value, parts, at)
        const clash = parts.values.find((part) => part.includes(node.separator))
        if (clash !== undefined) {
          throw new ProtocolError(
            `${at.header}: ${at.label} contains its separator`,
            'XT_VALUE',
          )
        }
        writer.string(parts.values.join(node.separator))
        return
      }
      case 'object':
        for (const [key, child] of node.shape) {
          const item = (value as Record<string, unknown>)[key]
          this.writeNode(child, item, writer, FormatCodec.child(at, key))
        }
        return
      case 'optional':
        if (value !== undefined) this.writeNode(node.item, value, writer, at)
        return
      case 'map':
        this.writeNode(node.item, this.unmapped(node, value, at), writer, at)
        return
      default:
        writer.string(this.toText(node, value, at))
    }
  }

  /**
   * Writes a list as arguments
   * @param item The item shape
   * @param items The items to write
   * @param writer The writer to add the arguments to
   * @param at Where the list sits
   */
  private writeItems(
    item: FieldNode,
    items: unknown,
    writer: XtWriter,
    at: FieldPath,
  ): void {
    ;(items as readonly unknown[]).forEach((value, index) => {
      this.writeNode(item, value, writer, FormatCodec.child(at, index))
    })
  }
}
