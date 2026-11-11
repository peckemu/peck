import { inflateRawSync, inflateSync } from 'node:zlib'

import { type AmfObject, AmfReader, type AmfValue } from '#content/amf'
import { Definition } from '#content/definition'
import { ContentError } from '#content/error'

/**
 * A def pack
 * @class
 */
export class Pack {
  /**
   * The pack's value
   */
  private readonly value: AmfValue

  /**
   * Creates a pack
   * @param value The pack's value
   */
  public constructor(value: AmfValue) {
    this.value = value
  }

  /**
   * Reads a served pack
   * @param bytes The served bytes
   * @returns The pack
   */
  public static read(bytes: Uint8Array): Pack {
    return new Pack(
      AmfReader.decode(
        Pack.inflate(Pack.inflate(bytes, inflateSync), inflateRawSync),
      ),
    )
  }

  /**
   * Inflates compressed bytes
   * @param bytes The bytes
   * @param inflate The inflate function
   * @returns The inflated bytes
   */
  private static inflate(
    bytes: Uint8Array,
    inflate: (bytes: Uint8Array) => Buffer,
  ): Uint8Array {
    try {
      return new Uint8Array(inflate(bytes))
    } catch {
      return bytes
    }
  }

  /**
   * Lists the pack's definitions
   * @returns The definitions
   */
  public definitions(): Definition[] {
    return Object.values(this.entries())
      .filter((value): value is AmfObject => Pack.isObject(value))
      .map((fields) => new Definition(fields))
  }

  /**
   * Lists the pack's entries
   * @returns The entries
   */
  public entries(): Readonly<Record<string, AmfValue>> {
    if (Array.isArray(this.value)) {
      return Object.fromEntries(this.value.entries())
    }
    if (Pack.isObject(this.value)) return this.value
    throw new ContentError('A pack holds a list or an object')
  }

  /**
   * Whether a value is a plain object
   * @param value The value
   * @returns Whether it is
   */
  private static isObject(value: AmfValue): value is AmfObject {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      !(value instanceof Uint8Array)
    )
  }
}

/**
 * The def packs by id
 * @class
 */
export class PackSet {
  /**
   * The packs by id
   */
  private readonly packs: ReadonlyMap<number, Pack>

  /**
   * Creates the set
   * @param packs The packs by id
   */
  public constructor(packs: ReadonlyMap<number, Pack>) {
    this.packs = packs
  }

  /**
   * Gets a pack
   * @param id The pack id
   * @returns The pack
   */
  public get(id: number): Pack {
    const pack = this.packs.get(id)
    if (!pack) throw new ContentError(`Pack ${String(id)} was not fetched`)

    return pack
  }
}
