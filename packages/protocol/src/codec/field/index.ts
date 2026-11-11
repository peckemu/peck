import { Schema } from '#protocol/codec/schema'
import { type XmlMessage } from '#protocol/wire/xml/message'

/**
 * A field's placement
 */
export type FieldOptions = {
  /**
   * Where the value sits in XML
   */
  readonly path?: string
  /**
   * The JSON key
   */
  readonly key?: string
  /**
   * Whether XML wraps it in CDATA
   */
  readonly cdata?: boolean
  /**
   * Whether the value is kept out of logs
   */
  readonly redacted?: boolean
  /**
   * The default
   */
  readonly default?: unknown
}

/**
 * Fails parsing
 */
export type Fail = (problem: string) => never

/**
 * The shape of one value
 */
export type FieldType =
  /**
   * A scalar
   */
  | { readonly kind: 'string' | 'int' | 'uint' | 'number' | 'bool' }
  /**
   * An integer from a fixed set
   */
  | { readonly kind: 'enum'; readonly values: ReadonlySet<number> }
  /**
   * A counted list
   */
  | { readonly kind: 'list'; readonly item: FieldNode }
  /**
   * A fixed number of items with no count
   */
  | {
      readonly kind: 'array'
      readonly item: FieldNode
      readonly length: number
    }
  /**
   * Every XT argument left
   */
  | { readonly kind: 'rest'; readonly item: FieldNode }
  /**
   * Several values joined
   */
  | {
      readonly kind: 'split'
      readonly item: FieldNode
      readonly separator: string
    }
  /**
   * A nested shape
   */
  | {
      readonly kind: 'object'
      readonly shape: readonly (readonly [string, FieldNode])[]
    }
  /**
   * May be absent
   */
  | { readonly kind: 'optional'; readonly item: FieldNode }
  /**
   * A mapped value
   */
  | {
      readonly kind: 'map'
      readonly item: FieldNode
      readonly read: (value: unknown, fail: Fail) => unknown
      readonly write: ((value: unknown) => unknown) | null
    }
  /**
   * A raw JSON object
   */
  | { readonly kind: 'record' }
  /**
   * Data outside the fields
   */
  | { readonly kind: 'message'; readonly key: 'signature' | 'signedBody' }

/**
 * A field type
 */
export type FieldNode = FieldType & {
  /**
   * The field's placement
   */
  readonly options: FieldOptions
  /**
   * How the type is shown
   */
  readonly name: string
}

/**
 * Checks a field's type
 */
type Fits<T, V> = [Exclude<T, undefined>] extends [Exclude<V, undefined>]
  ? unknown
  : never

/**
 * Decorates a packet field
 */
export type FieldDecorator<T> = <This, V extends T | undefined>(
  value: undefined,
  context: ClassFieldDecoratorContext<This, V> & Fits<T, V>,
) => void

/**
 * A field's definition
 */
export type FieldDefinition<T> = FieldDecorator<T> & {
  /**
   * The definition's shape
   */
  readonly node: FieldNode
  /**
   * The type for inference
   */
  readonly value?: T
}

/**
 * A definition's type
 */
export type FieldValue<D> = D extends FieldDefinition<infer T> ? T : never

/**
 * An object field's type
 */
export type FieldShape<S> = { readonly [K in keyof S]: FieldValue<S[K]> }

/**
 * The nested fields
 */
type Shape = Readonly<Record<string, FieldDefinition<unknown>>>

/**
 * The field definitions
 * @class
 */
export class Field {
  /**
   * Defines a string field
   * @param options The field's placement
   * @returns The field definition
   */
  public static string(options?: FieldOptions): FieldDefinition<string> {
    return Field.define({ kind: 'string' }, 'string', options)
  }

  /**
   * Defines a decimal integer field
   * @param options The field's placement
   * @returns The field definition
   */
  public static int(options?: FieldOptions): FieldDefinition<number> {
    return Field.define({ kind: 'int' }, 'int', options)
  }

  /**
   * Defines a 32 bit unsigned integer field
   * @param options The field's placement
   * @returns The field definition
   */
  public static uint(options?: FieldOptions): FieldDefinition<number> {
    return Field.define({ kind: 'uint' }, 'uint', options)
  }

  /**
   * Defines a number field
   * @param options The field's placement
   * @returns The field definition
   */
  public static number(options?: FieldOptions): FieldDefinition<number> {
    return Field.define({ kind: 'number' }, 'number', options)
  }

  /**
   * Defines a flag
   * @param options The field's placement
   * @returns The field definition
   */
  public static bool(options?: FieldOptions): FieldDefinition<boolean> {
    return Field.define({ kind: 'bool' }, 'bool', options)
  }

  /**
   * Defines an integer from a fixed set
   * @param values The object holding the allowed values
   * @param options The field's placement
   * @returns The field definition
   */
  public static enum<const E extends Readonly<Record<string, number>>>(
    values: E,
    options?: FieldOptions,
  ): FieldDefinition<E[keyof E]> {
    return Field.define(
      { kind: 'enum', values: new Set(Object.values(values)) },
      'enum',
      options,
    )
  }

  /**
   * Defines a list of items with a count
   * @param item The item definition
   * @param options The field's placement
   * @returns The field definition
   */
  public static list<T>(
    item: FieldDefinition<T>,
    options?: FieldOptions,
  ): FieldDefinition<readonly T[]> {
    return Field.define(
      { kind: 'list', item: item.node },
      `list<${item.node.name}>`,
      options,
    )
  }

  /**
   * Defines a fixed number of items with no count
   * @param item The item definition
   * @param length The number of items
   * @param options The field's placement
   * @returns The field definition
   */
  public static array<T>(
    item: FieldDefinition<T>,
    length: number,
    options?: FieldOptions,
  ): FieldDefinition<readonly T[]> {
    const name = `array<${item.node.name}, ${length}>`
    return Field.define(
      { kind: 'array', item: item.node, length },
      name,
      options,
    )
  }

  /**
   * Defines the remaining arguments
   * @param item The item definition
   * @param options The field's placement
   * @returns The field definition
   */
  public static rest<T = string>(
    item: FieldDefinition<T> = Field.string() as FieldDefinition<T>,
    options?: FieldOptions,
  ): FieldDefinition<readonly T[]> {
    return Field.define(
      { kind: 'rest', item: item.node },
      `rest<${item.node.name}>`,
      options,
    )
  }

  /**
   * Defines a joined field
   * @param separator The separator
   * @param item The item definition
   * @param options The field's placement
   * @returns The field definition
   */
  public static split<T = string>(
    separator: string,
    item: FieldDefinition<T> = Field.string() as FieldDefinition<T>,
    options?: FieldOptions,
  ): FieldDefinition<readonly T[]> {
    const name = `split<${item.node.name}, '${separator}'>`
    return Field.define(
      { kind: 'split', item: item.node, separator },
      name,
      options,
    )
  }

  /**
   * Defines a nested shape
   * @param shape The field definitions
   * @param options The field's placement
   * @returns The field definition
   */
  public static object<const S extends Shape>(
    shape: S,
    options?: FieldOptions,
  ): FieldDefinition<FieldShape<S>> {
    const entries = Object.entries(shape).map(
      ([key, field]) => [key, field.node] as const,
    )
    const name = `{ ${entries.map(([key, node]) => `${key}: ${node.name}`).join(', ')} }`
    return Field.define({ kind: 'object', shape: entries }, name, options)
  }

  /**
   * Defines an optional field
   * @param item The value's definition
   * @returns The field definition
   */
  public static optional<T>(
    item: FieldDefinition<T>,
  ): FieldDefinition<T | undefined> {
    return Field.define(
      { kind: 'optional', item: item.node },
      `${item.node.name}?`,
      item.node.options,
    )
  }

  /**
   * Defines a mapped field
   * @param item The wire definition
   * @param mapping How the value is mapped
   * @returns The field definition
   */
  public static map<From, To>(
    item: FieldDefinition<From>,
    mapping: {
      read: (value: From, fail: Fail) => To
      write?: (value: To) => From
    },
  ): FieldDefinition<To> {
    const { read, write } = mapping
    return Field.define(
      {
        kind: 'map',
        item: item.node,
        read: read as (value: unknown, fail: Fail) => unknown,
        write: (write as ((value: unknown) => unknown) | undefined) ?? null,
      },
      item.node.name,
      item.node.options,
    )
  }

  /**
   * Defines a raw JSON object
   * @param options The field's placement
   * @returns The field definition
   */
  public static record<T extends Readonly<Record<string, unknown>>>(
    options?: FieldOptions,
  ): FieldDefinition<T> {
    return Field.define({ kind: 'record' }, 'record', options)
  }

  /**
   * XML message options
   * @param key Which of the two to read
   * @param options The field's placement
   * @returns The field definition
   */
  public static message<K extends 'signature' | 'signedBody'>(
    key: K,
    options?: FieldOptions,
  ): FieldDefinition<XmlMessage[K]> {
    return Field.define({ kind: 'message', key }, `message.${key}`, options)
  }

  /**
   * Creates a field definition
   * @param type The shape of the value
   * @param name How the type is shown
   * @param options The field's placement
   * @returns The field definition
   */
  private static define<T>(
    type: FieldType,
    name: string,
    options: FieldOptions = {},
  ): FieldDefinition<T> {
    const node: FieldNode = { ...type, name, options }
    const decorator = (
      _value: undefined,
      context: ClassFieldDecoratorContext,
    ): void => {
      const key = context.name
      if (context.static || context.private || typeof key !== 'string') {
        throw new TypeError(`${String(key)} must be a public field`)
      }
      Schema.add(context.metadata, key, node)
    }
    return Object.assign(decorator as FieldDecorator<T>, { node })
  }
}
