import { type FieldNode } from '#protocol/codec/field'
import {
  type FieldPath,
  FormatCodec,
  type WriteTarget,
} from '#protocol/codec/format'
import { type Schema } from '#protocol/codec/schema'
import { JsonMessage } from '#protocol/wire/json/message'

/**
 * Checks for a plain object
 */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Reads the value under a key
 */
const own = (
  object: Readonly<Record<string, unknown>>,
  key: string,
): unknown => (Object.hasOwn(object, key) ? object[key] : undefined)

/**
 * Reads and writes fields as JSON values
 * @class
 */
export class JsonCodec extends FormatCodec<JsonMessage> {
  /**
   * The packet format this codec handles
   */
  public readonly format = 'json'

  /**
   * Reads a message's fields
   * @param message The message to read
   * @param schema The message schema
   * @returns The message fields
   */
  public read(message: JsonMessage, schema: Schema): Record<string, unknown> {
    return this.readObject(
      schema.fields.map(({ key, node }) => [key, node]),
      message.params,
      {
        header: message.header,
        label: '',
      },
    )
  }

  /**
   * Writes a server frame
   * @param target The target
   * @returns The message as text
   */
  public write({ header, room, schema, source }: WriteTarget): string {
    const shape = schema.fields.map(({ key, node }) => [key, node] as const)
    return JsonMessage.build(
      header,
      room,
      this.writeObject(shape, source, { header, label: '' }),
    )
  }

  /**
   * Checks whether JSON can carry a node
   * @param node The node to check
   * @returns Whether JSON can carry the node
   */
  protected supports(node: FieldNode): boolean {
    return node.kind !== 'rest' && node.kind !== 'message'
  }

  /**
   * Reads a field's value
   * @param node The shape of the value
   * @param value The JSON value to read
   * @param at Where the value sits
   * @returns The value read
   */
  private readNode(node: FieldNode, value: unknown, at: FieldPath): unknown {
    const wrong = (expected: string): never => {
      throw this.fail(at, `is not ${expected}`)
    }
    switch (node.kind) {
      case 'string':
        return typeof value === 'string' ? value : wrong('a string')
      case 'bool':
        return typeof value === 'boolean' ? value : wrong('a boolean')
      case 'int':
        return Number.isSafeInteger(value) ? value : wrong('an integer')
      case 'uint':
        return Number.isSafeInteger(value)
          ? (value as number) >>> 0
          : wrong('an integer')
      case 'number':
        return Number.isFinite(value) ? value : wrong('a number')
      case 'enum':
        return typeof value === 'number' && node.values.has(value)
          ? value
          : wrong('a known value')
      case 'record':
        return isRecord(value) ? value : wrong('an object')
      case 'list':
      case 'array': {
        if (!Array.isArray(value)) return wrong('a list')
        if (node.kind === 'array' && value.length !== node.length) {
          return wrong(`a list of ${node.length}`)
        }
        return value.map((item: unknown, index) =>
          this.readNode(node.item, item, FormatCodec.child(at, index)),
        )
      }
      case 'split': {
        if (typeof value !== 'string') return wrong('a string')
        return (value === '' ? [] : value.split(node.separator)).map(
          (part, index) =>
            this.fromText(node.item, part, FormatCodec.child(at, index)),
        )
      }
      case 'object':
        return isRecord(value)
          ? this.readObject(node.shape, value, at)
          : wrong('an object')
      case 'optional':
        return value === undefined || value === null
          ? undefined
          : this.readNode(node.item, value, at)
      case 'map':
        return this.mapped(node, this.readNode(node.item, value, at), at)
      default:
        throw new TypeError(
          `${at.header}: ${at.label} is not supported in JSON`,
        )
    }
  }

  /**
   * Reads an object's fields
   * @param shape The fields of the object
   * @param object The JSON object to read
   * @param at Where the object sits
   * @returns The values by name
   */
  private readObject(
    shape: readonly (readonly [string, FieldNode])[],
    object: Readonly<Record<string, unknown>>,
    at: FieldPath,
  ): Record<string, unknown> {
    const values: Record<string, unknown> = {}
    for (const [key, node] of shape) {
      const name = node.options.key ?? key
      values[key] = this.readNode(
        node,
        own(object, name),
        JsonCodec.key(at, name),
      )
    }
    return values
  }

  /**
   * Turns a value into JSON
   * @param node The shape of the value
   * @param raw The value to write
   * @param at Where the value sits
   * @returns The JSON value
   */
  private writeNode(node: FieldNode, raw: unknown, at: FieldPath): unknown {
    const value = this.valueOf(node, raw, at)
    switch (node.kind) {
      case 'list':
      case 'array':
        return (value as readonly unknown[]).map((item, index) =>
          this.writeNode(node.item, item, FormatCodec.child(at, index)),
        )
      case 'split':
        return (value as readonly unknown[])
          .map((item, index) =>
            this.toText(node.item, item, FormatCodec.child(at, index)),
          )
          .join(node.separator)
      case 'object':
        return this.writeObject(node.shape, value as object, at)
      case 'optional':
        return value === undefined
          ? undefined
          : this.writeNode(node.item, value, at)
      case 'map':
        return this.writeNode(node.item, this.unmapped(node, value, at), at)
      default:
        return value
    }
  }

  /**
   * Writes an object's fields
   * @param shape The fields of the object
   * @param source The object holding the values
   * @param at Where the object sits
   * @returns The JSON object
   */
  private writeObject(
    shape: readonly (readonly [string, FieldNode])[],
    source: object,
    at: FieldPath,
  ): Record<string, unknown> {
    const object: Record<string, unknown> = {}
    for (const [key, node] of shape) {
      const name = node.options.key ?? key
      const value = this.writeNode(
        node,
        (source as Record<string, unknown>)[key],
        JsonCodec.key(at, name),
      )
      if (value !== undefined) object[name] = value
    }
    return object
  }

  /**
   * Builds a key's path
   * @param at The path of the parent object
   * @param name The key
   * @returns The path of the value
   */
  private static key(at: FieldPath, name: string): FieldPath {
    return at.label === ''
      ? { header: at.header, label: name }
      : FormatCodec.child(at, name)
  }
}
