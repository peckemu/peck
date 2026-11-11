import { Schema } from '#protocol/codec/schema'
import { type PacketFormat } from '#protocol/wire/message'

/**
 * A packet from the client
 * @class
 */
export abstract class IncomingPacket {
  /**
   * The header of the packet
   */
  declare public static readonly header: string

  /**
   * The format of the packet
   */
  declare public static readonly format: PacketFormat

  /**
   * Its header
   */
  public readonly header: string = ''

  /**
   * Its room
   */
  public readonly room: number = -1

  /**
   * The packet's fields in order
   * @returns The schema of the packet class
   */
  public static get schema(): Schema {
    return Schema.of(this)
  }

  /**
   * Lists the header
   * @returns The packet as a plain object
   */
  public toJSON(): Record<string, unknown> {
    return {
      header: this.header,
      room: this.room,
      ...Schema.of(this.constructor).toJSON(this),
    }
  }
}

/**
 * The class of a typed incoming packet
 */
export type IncomingPacketType<T extends IncomingPacket = IncomingPacket> =
  (new () => T) & {
    readonly header: string
    readonly format: PacketFormat
    readonly name: string
  }
