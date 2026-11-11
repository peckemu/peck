import { Codecs } from '#protocol/codec/codecs'
import { Schema } from '#protocol/codec/schema'
import {
  IncomingPacket,
  type IncomingPacketType,
} from '#protocol/packet/incoming'
import {
  OutgoingPacket,
  type OutgoingPacketType,
} from '#protocol/packet/outgoing'
import { PacketRegistry } from '#protocol/packet/registry'
import { type PacketFormat } from '#protocol/wire/message'

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
      })
      outgoingPackets.register(target as unknown as OutgoingPacketType)
    } else {
      throw new TypeError(`${target.name} is not a packet`)
    }
  }
