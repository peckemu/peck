import { Codecs } from '#protocol/codec/codecs'
import { Schema } from '#protocol/codec/schema'
import { type PacketFormat } from '#protocol/wire/message'

/**
 * The non-method keys
 */
type DataKey<T> = {
  [K in keyof T]-?: T[K] extends (...args: never[]) => unknown ? never : K
}[keyof T]

/**
 * The data keys of a packet
 */
type OwnKey<T> = Exclude<DataKey<T>, keyof OutgoingPacket>

/**
 * A packet's optional keys
 */
type OptionalKey<T> = {
  [K in OwnKey<T>]-?: undefined extends T[K] ? K : never
}[OwnKey<T>]

/**
 * A packet's required keys
 */
type RequiredKey<T> = Exclude<OwnKey<T>, OptionalKey<T>>

/**
 * The packet's fields
 */
export type PacketFields<T> = { readonly [K in RequiredKey<T>]: T[K] } & {
  readonly [K in OptionalKey<T>]?: Exclude<T[K], undefined>
} & {
  /**
   * The target room
   */
  readonly room?: number
}

/**
 * The fields argument
 */
export type PacketArgs<T> = [RequiredKey<T>] extends [never]
  ? [fields?: PacketFields<T>]
  : [fields: PacketFields<T>]

/**
 * A packet for the client
 * @class
 */
export abstract class OutgoingPacket {
  /**
   * The header of the packet
   */
  declare public static readonly header: string

  /**
   * The format of the packet
   */
  declare public static readonly format: PacketFormat

  /**
   * The default room
   */
  declare public static readonly room: number

  /**
   * The XML envelope's handler
   */
  declare public static readonly handler: string

  /**
   * The target room
   */
  public readonly room?: number

  /**
   * The packet's fields in order
   * @returns The schema of the packet class
   */
  public static get schema(): Schema {
    return Schema.of(this)
  }

  /**
   * Writes the packet
   * @returns The frame
   */
  public toString(): string {
    const type = this.constructor as typeof OutgoingPacket
    return Codecs.write(type.format, {
      header: type.header,
      room: this.room ?? type.room,
      handler: type.handler,
      schema: Schema.of(type),
      source: this,
    })
  }

  /**
   * Lists the header
   * @returns The packet as a plain object
   */
  public toJSON(): Record<string, unknown> {
    const type = this.constructor as typeof OutgoingPacket
    return {
      header: type.header,
      room: this.room ?? type.room,
      ...Schema.of(type).toJSON(this),
    }
  }
}

/**
 * The class of a typed outgoing packet
 */
export type OutgoingPacketType<T extends OutgoingPacket = OutgoingPacket> =
  (new () => T) & {
    readonly header: string
    readonly format: PacketFormat
    readonly name: string
  }
