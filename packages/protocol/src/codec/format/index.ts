import { type FieldNode, type FieldType } from '#protocol/codec/field'
import { type Schema } from '#protocol/codec/schema'
import { ProtocolError } from '#protocol/error'
import { type Message, type PacketFormat } from '#protocol/wire/message'
import { Numbers } from '#protocol/wire/numbers'

/**
 * Where a value sits
 */
export type FieldPath = {
  /**
   * The header of the packet
   */
  readonly header: string
  /**
   * The field's path in the packet
   */
  readonly label: string
}

/**
 * A codec's packet input
 */
export type WriteTarget = {
  /**
   * The header of the packet
   */
  readonly header: string
  /**
   * The packet's room
   */
  readonly room: number
  /**
   * The XML envelope's handler
   */
  readonly handler: string
  /**
   * The packet's schema
   */
  readonly schema: Schema
  /**
   * The object holding the fields' values
   */
  readonly source: object
}

/**
 * The largest 32 bit unsigned integer
 */
const UINT_MAX = 0xffffffff

/**
 * A packet codec
 * @class
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- each codec reads its own format's message
export abstract class FormatCodec<M extends Message> {
  /**
   * The packet format this codec handles
   */
  public abstract readonly format: PacketFormat

  /**
   * Reads the fields of a client message
   * @param message The message to read
   * @param schema The message schema
   * @returns The message fields
   */
  public abstract read(message: M, schema: Schema): Record<string, unknown>

  /**
   * Writes a server frame
   * @param target The target
   * @returns The message as text
   */
  public abstract write(target: WriteTarget): string

  /**
   * Refuses an unsupported field
   * @param schema The schema to check
   * @param name The name of the packet class
   */
  public validate(schema: Schema, name: string): void {
    const check = (node: FieldNode, label: string): void => {
      if (!this.supports(node)) {
        throw new TypeError(
          `${name}: ${label} is not supported in ${this.format}`,
        )
      }
      if ('item' in node) check(node.item, `${label}[]`)
      if (node.kind === 'object') {
        for (const [key, child] of node.shape) check(child, `${label}.${key}`)
      }
    }
    for (const { key, node } of schema.fields) check(node, key)
  }

  /**
   * Checks a node is supported
   * @param node The node to check
   * @returns Whether the format can carry the node
   */
  protected abstract supports(node: FieldNode): boolean

  /**
   * Reads a scalar written as text
   * @param node The shape of the value
   * @param text The text to read
   * @param at Where the value sits
   * @returns The value
   */
  protected fromText(node: FieldNode, text: string, at: FieldPath): unknown {
    switch (node.kind) {
      case 'string':
        return text
      case 'bool':
        return text !== '0'
      case 'int':
      case 'uint':
      case 'enum': {
        const value = Numbers.integer(text)
        if (value === null) throw this.fail(at, 'is not an integer')
        if (node.kind === 'enum' && !node.values.has(value)) {
          throw this.fail(at, 'is not a known value')
        }
        return node.kind === 'uint' ? value >>> 0 : value
      }
      case 'number': {
        const value = Numbers.decimal(text)
        if (value === null) throw this.fail(at, 'is not a number')
        return value
      }
      default:
        throw new TypeError(`${at.header}: ${at.label} is not text`)
    }
  }

  /**
   * Writes a scalar as text
   * @param node The shape of the value
   * @param at Where the value sits
   * @returns The value as text
   */
  protected toText(node: FieldNode, value: unknown, at: FieldPath): string {
    const wrong = (expected: string): never => {
      throw new TypeError(`${at.header}: ${at.label} is not ${expected}`)
    }
    switch (node.kind) {
      case 'string':
        return typeof value === 'string' ? value : wrong('a string')
      case 'bool':
        return typeof value === 'boolean'
          ? value
            ? '1'
            : '0'
          : wrong('a boolean')
      case 'int':
      case 'enum':
        return Number.isInteger(value) ? String(value) : wrong('an integer')
      case 'uint':
        return Number.isInteger(value) &&
          (value as number) >= 0 &&
          (value as number) <= UINT_MAX
          ? String(value)
          : wrong('an unsigned integer')
      case 'number':
        return Number.isFinite(value) ? String(value) : wrong('a finite number')
      default:
        throw new TypeError(`${at.header}: ${at.label} is not text`)
    }
  }

  /**
   * Picks a field's value
   * @param node The shape of the value
   * @param at Where the value sits
   * @returns The field's value
   */
  protected valueOf(node: FieldNode, value: unknown, at: FieldPath): unknown {
    const resolved = value ?? node.options.default
    if (resolved === undefined && node.kind !== 'optional') {
      throw new TypeError(`${at.header}: ${at.label} has no value`)
    }
    return resolved
  }

  /**
   * Reads a mapped value
   * @param node The map field
   * @param at Where the value sits
   * @returns The mapped value
   */
  protected mapped(
    node: Extract<FieldType, { kind: 'map' }>,
    value: unknown,
    at: FieldPath,
  ): unknown {
    return node.read(value, (problem) => {
      throw this.fail(at, problem)
    })
  }

  /**
   * Unmaps a field value
   * @param node The map field
   * @param at Where the value sits
   * @returns The inner value
   */
  protected unmapped(
    node: Extract<FieldType, { kind: 'map' }>,
    value: unknown,
    at: FieldPath,
  ): unknown {
    if (!node.write) {
      throw new TypeError(`${at.header}: ${at.label} is read only`)
    }
    return node.write(value)
  }

  /**
   * Creates a read error
   * @param at Where the value sits
   * @param problem The problem
   * @returns The error naming the field
   */
  protected fail(at: FieldPath, problem: string): ProtocolError {
    return ProtocolError.field(at.header, at.label, problem)
  }

  /**
   * Builds the path of a child value
   * @param at The path of the parent value
   * @param key The child's key
   * @returns The path of the child
   */
  protected static child(at: FieldPath, key: string | number): FieldPath {
    return {
      header: at.header,
      label:
        typeof key === 'number' ? `${at.label}[${key}]` : `${at.label}.${key}`,
    }
  }
}
