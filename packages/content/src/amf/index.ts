import { ContentError } from '#content/error'

/**
 * An object read from AMF3
 */
export type AmfObject = { [key: string]: AmfValue }

/**
 * A value read from AMF3
 */
export type AmfValue =
  | undefined
  | null
  | boolean
  | number
  | string
  | Date
  | Uint8Array
  | AmfValue[]
  | AmfObject

/**
 * An object's traits
 */
type Traits = {
  readonly sealed: readonly string[]
  readonly dynamic: boolean
}

/**
 * The AMF3 type markers
 */
const MARKER = {
  undefined: 0x00,
  null: 0x01,
  false: 0x02,
  true: 0x03,
  integer: 0x04,
  double: 0x05,
  string: 0x06,
  xmlDoc: 0x07,
  date: 0x08,
  array: 0x09,
  object: 0x0a,
  xml: 0x0b,
  byteArray: 0x0c,
  vectorInt: 0x0d,
  vectorUint: 0x0e,
  vectorDouble: 0x0f,
} as const

/**
 * The UTF-8 decoder
 */
const UTF8 = new TextDecoder('utf-8', { fatal: true })

/**
 * Reads AMF3 values
 * @class
 */
export class AmfReader {
  /**
   * The bytes being read
   */
  private readonly bytes: Uint8Array

  /**
   * A view of the bytes
   */
  private readonly view: DataView

  /**
   * The read position
   */
  private position = 0

  /**
   * The strings read
   */
  private readonly strings: string[] = []

  /**
   * The objects read
   */
  private readonly objects: AmfValue[] = []

  /**
   * The traits read
   */
  private readonly traits: Traits[] = []

  /**
   * Creates a reader
   * @param bytes The bytes to read
   */
  public constructor(bytes: Uint8Array) {
    this.bytes = bytes
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  }

  /**
   * Reads one value
   * @param bytes The bytes
   * @returns The value
   */
  public static decode(bytes: Uint8Array): AmfValue {
    const reader = new AmfReader(bytes)
    const value = reader.read()
    if (reader.position !== bytes.length) {
      throw new ContentError(
        `${String(bytes.length - reader.position)} bytes follow the value`,
      )
    }
    return value
  }

  /**
   * Reads the next value
   * @returns The value
   */
  public read(): AmfValue {
    const marker = this.u8()
    switch (marker) {
      case MARKER.undefined:
        return undefined
      case MARKER.null:
        return null
      case MARKER.false:
        return false
      case MARKER.true:
        return true
      case MARKER.integer: {
        const value = this.u29()
        return value & 0x10000000 ? value - 0x20000000 : value
      }
      case MARKER.double:
        return this.f64()
      case MARKER.string:
        return this.string()
      case MARKER.date:
        return this.date()
      case MARKER.array:
        return this.array()
      case MARKER.object:
        return this.object()
      case MARKER.byteArray:
        return this.byteArray()
      case MARKER.xml:
      case MARKER.xmlDoc:
        return this.xml()
      case MARKER.vectorInt:
      case MARKER.vectorUint:
      case MARKER.vectorDouble:
        return this.vector(marker)
      default:
        throw new ContentError(
          `Marker ${String(marker)} is not one this reader knows`,
        )
    }
  }

  /**
   * Reads a date
   * @returns The date
   */
  private date(): AmfValue {
    const header = this.u29()
    if ((header & 1) === 0) return this.referenced(header >> 1)
    const date = new Date(this.f64())
    this.objects.push(date)
    return date
  }

  /**
   * Reads an array
   * @returns The array
   */
  private array(): AmfValue {
    const header = this.u29()
    if ((header & 1) === 0) return this.referenced(header >> 1)

    const dense: AmfValue[] = []
    const slot = this.objects.length
    this.objects.push(dense)

    const named: AmfObject = {}
    let hasNamed = false
    for (let key = this.string(); key !== ''; key = this.string()) {
      hasNamed = true
      named[key] = this.read()
    }
    for (let index = 0; index < header >> 1; index++) dense.push(this.read())
    if (!hasNamed) return dense

    const merged: AmfObject = {
      ...Object.fromEntries(dense.entries()),
      ...named,
    }
    this.objects[slot] = merged
    return merged
  }

  /**
   * Reads an object
   * @returns The object
   */
  private object(): AmfValue {
    const header = this.u29()
    if ((header & 1) === 0) return this.referenced(header >> 1)

    const traits = this.traitsOf(header)
    const value: AmfObject = {}
    this.objects.push(value)
    for (const name of traits.sealed) value[name] = this.read()
    if (traits.dynamic) {
      for (let key = this.string(); key !== ''; key = this.string()) {
        value[key] = this.read()
      }
    }
    return value
  }

  /**
   * Reads an object's traits
   * @param header The object's header
   * @returns The traits
   */
  private traitsOf(header: number): Traits {
    if ((header & 0b10) === 0) {
      const found = this.traits[header >> 2]
      if (!found) throw new ContentError('A traits reference to nothing')
      return found
    }
    if (header & 0b100) {
      throw new ContentError('Externalizable objects are not read')
    }

    this.string()
    const sealed = Array.from({ length: header >> 4 }, () => this.string())
    const traits = { sealed, dynamic: (header & 0b1000) !== 0 }
    this.traits.push(traits)
    return traits
  }

  /**
   * Reads a byte array
   * @returns The bytes
   */
  private byteArray(): AmfValue {
    const header = this.u29()
    if ((header & 1) === 0) return this.referenced(header >> 1)
    const bytes = this.take(header >> 1).slice()
    this.objects.push(bytes)
    return bytes
  }

  /**
   * Reads XML
   * @returns The text
   */
  private xml(): AmfValue {
    const header = this.u29()
    if ((header & 1) === 0) return this.referenced(header >> 1)
    const text = this.text(this.take(header >> 1))
    this.objects.push(text)
    return text
  }

  /**
   * Reads a vector of numbers
   * @param marker Which kind of vector it is
   * @returns The numbers
   */
  private vector(marker: number): AmfValue {
    const header = this.u29()
    if ((header & 1) === 0) return this.referenced(header >> 1)

    const count = header >> 1
    this.u8()
    const size = marker === MARKER.vectorDouble ? 8 : 4
    this.need(count * size)

    const values = Array.from({ length: count }, (_, index) => {
      const at = this.position + index * size
      if (marker === MARKER.vectorInt) return this.view.getInt32(at)
      if (marker === MARKER.vectorUint) return this.view.getUint32(at)
      return this.view.getFloat64(at)
    })
    this.position += count * size
    this.objects.push(values)
    return values
  }

  /**
   * Finds a referenced object
   * @param index The object's index
   * @returns The object
   */
  private referenced(index: number): AmfValue {
    if (index >= this.objects.length) {
      throw new ContentError('A reference to nothing')
    }
    return this.objects[index]
  }

  /**
   * Reads a string
   * @returns The string
   */
  private string(): string {
    const header = this.u29()
    if ((header & 1) === 0) {
      const found = this.strings[header >> 1]
      if (found === undefined) {
        throw new ContentError('A string reference to nothing')
      }
      return found
    }
    if (header >> 1 === 0) return ''
    const text = this.text(this.take(header >> 1))
    this.strings.push(text)
    return text
  }

  /**
   * Reads bytes as UTF-8
   * @param bytes The bytes
   * @returns The text
   */
  private text(bytes: Uint8Array): string {
    try {
      return UTF8.decode(bytes)
    } catch {
      throw new ContentError('Text is not UTF-8')
    }
  }

  /**
   * Reads a 29 bit number
   * @returns The number
   */
  private u29(): number {
    let value = 0
    for (let index = 0; index < 3; index++) {
      const byte = this.u8()
      value = (value << 7) | (byte & 0x7f)
      if ((byte & 0x80) === 0) return value
    }
    return ((value << 8) | this.u8()) >>> 0
  }

  /**
   * Reads a byte
   * @returns The byte
   */
  private u8(): number {
    this.need(1)
    return this.view.getUint8(this.position++)
  }

  /**
   * Reads a double
   * @returns The number
   */
  private f64(): number {
    this.need(8)
    const value = this.view.getFloat64(this.position)
    this.position += 8
    return value
  }

  /**
   * Reads some bytes
   * @param length How many
   * @returns The bytes
   */
  private take(length: number): Uint8Array {
    this.need(length)
    const bytes = this.bytes.subarray(this.position, this.position + length)
    this.position += length
    return bytes
  }

  /**
   * Checks enough bytes are left
   * @param count The count
   */
  private need(count: number): void {
    if (this.position + count > this.bytes.length) {
      throw new ContentError('The value runs past the end')
    }
  }
}
