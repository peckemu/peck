import { type FieldNode } from '#protocol/codec/field'

if ((Symbol as { metadata?: symbol }).metadata === undefined) {
  Object.defineProperty(Symbol, 'metadata', {
    value: Symbol.for('Symbol.metadata'),
  })
}

/**
 * A decorated field
 */
export type SchemaField = {
  /**
   * The property name
   */
  readonly key: string
  /**
   * The shape of the field's value
   */
  readonly node: FieldNode
}

/**
 * The fields metadata key
 */
const FIELDS = Symbol('peck.fields')

/**
 * The fields metadata
 */
type Store = { [FIELDS]?: SchemaField[] }

/**
 * A packet class's fields
 * @class
 */
export class Schema {
  /**
   * Schemas already built
   */
  private static readonly cache = new WeakMap<DecoratorMetadataObject, Schema>()

  /**
   * The empty schema
   */
  private static readonly none = new Schema([])

  /**
   * The fields in declaration order
   */
  public readonly fields: readonly SchemaField[]

  /**
   * Creates a schema from a list of fields
   * @param fields The fields in declaration order
   */
  private constructor(fields: readonly SchemaField[]) {
    this.fields = fields
  }

  /**
   * Records a field in a class's metadata
   * @param metadata The class metadata
   * @param key The name of the property
   * @param node The shape of the field's value
   */
  public static add(
    metadata: DecoratorMetadataObject,
    key: string,
    node: FieldNode,
  ): void {
    const store = metadata as Store
    if (!Object.hasOwn(store, FIELDS)) {
      store[FIELDS] = [...(store[FIELDS] ?? [])]
    }
    store[FIELDS]?.push({ key, node })
  }

  /**
   * Retrieves the schema of a class
   * @param type The class to read the schema of
   * @returns The class's schema
   */
  public static of(type: object): Schema {
    const metadata = (
      type as { [Symbol.metadata]?: DecoratorMetadataObject | null }
    )[Symbol.metadata]
    return metadata ? Schema.from(metadata) : Schema.none
  }

  /**
   * Retrieves a class's schema
   * @param metadata The metadata of the class
   * @returns The schema
   */
  public static from(metadata: DecoratorMetadataObject): Schema {
    let schema = Schema.cache.get(metadata)
    if (!schema) {
      schema = new Schema((metadata as Store)[FIELDS] ?? [])
      Schema.cache.set(metadata, schema)
    }
    return schema
  }

  /**
   * Describes the fields
   * @returns The fields as text
   */
  public describe(): string {
    return this.fields.map(({ key, node }) => `${key}: ${node.name}`).join(', ')
  }

  /**
   * Reads the fields' values from an object
   * @param source The source object
   * @returns The values by name
   */
  public toJSON(source: object): Record<string, unknown> {
    const values: Record<string, unknown> = {}
    for (const { key, node } of this.fields) {
      values[key] = node.options.redacted
        ? '[redacted]'
        : (source as Record<string, unknown>)[key]
    }
    return values
  }
}
