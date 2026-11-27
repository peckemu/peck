import { Codecs } from '../../codec/codecs/index.ts'
import { Schema } from '../../codec/schema/index.ts'
import { IncomingPacket, type IncomingPacketType } from '../incoming/index.ts'
import { OutgoingPacket, type OutgoingPacketType } from '../outgoing/index.ts'
import { PacketRegistry } from '../registry/index.ts'
import { type PacketFormat } from '../../wire/message/index.ts'

/**
 * Every incoming packet class
 */
export const incomingPackets = new PacketRegistry<IncomingPacketType>()

/**
 * Every outgoing packet class
 */
export const outgoingPackets = new PacketRegistry<OutgoingPacketType>()

/**
 * Extra settings for an outgoing packet
 */
export type PacketOptions = {
  /**
   * The default room
   */
  readonly room?: number
  /**
   * The XML envelope's handler
   */
  readonly handler?: string
  /**
   * Whether the room is left out
   */
  readonly roomless?: boolean
}

/**
 * Marks a class as a packet
 */
export const Packet =
  (header: string, format: PacketFormat, options: PacketOptions = {}) =>
  <
    T extends (abstract new () => IncomingPacket | OutgoingPacket) & {
      readonly name: string
    },
  >(
    target: T,
    context: ClassDecoratorContext<T>,
  ): void => {
    Codecs.get(format).validate(Schema.from(context.metadata), target.name)
    Object.defineProperties(target, {
      header: { value: header },
      format: { value: format },
    })
    if (target.prototype instanceof IncomingPacket) {
      incomingPackets.register(target as unknown as IncomingPacketType)
    } else if (target.prototype instanceof OutgoingPacket) {
      Object.defineProperties(target, {
        room: { value: options.room ?? (format === 'xml' ? 0 : -1) },
        handler: { value: options.handler ?? 'sys' },
        roomless: { value: options.roomless ?? false },
      })
      outgoingPackets.register(target as unknown as OutgoingPacketType)
    } else {
      throw new TypeError(`${target.name} is not a packet`)
    }
  }
