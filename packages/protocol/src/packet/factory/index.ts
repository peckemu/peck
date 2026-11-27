import { Codecs } from '../../codec/codecs/index.ts'
import { Schema } from '../../codec/schema/index.ts'
import { ProtocolError } from '../../error/index.ts'
import { incomingPackets } from '../decorator/index.ts'
import { type IncomingPacket } from '../incoming/index.ts'
import { type OutgoingPacket, type PacketArgs } from '../outgoing/index.ts'
import { RawIncoming } from '../raw/incoming/index.ts'
import { RawOutgoing } from '../raw/outgoing/index.ts'
import { JsonMessage } from '../../wire/json/message/index.ts'
import { type Message } from '../../wire/message/index.ts'
import { XmlMessage } from '../../wire/xml/message/index.ts'
import { XtMessage } from '../../wire/xt/message/index.ts'

/**
 * Parses and builds packets
 * @class
 */
export class PacketFactory {
  /**
   * Reads a client frame
   * @param frame The frame to read
   * @returns The packet
   */
  public static parse(frame: string): IncomingPacket {
    const message = PacketFactory.message(frame)
    const type = incomingPackets.resolve(message.format, message.header)
    if (!type) return new RawIncoming(message)
    const packet = new type()
    return Object.assign(packet, {
      header: message.header,
      room: message.room,
      ...Codecs.read(message, Schema.of(type)),
    })
  }

  /**
   * Reads an expected client frame
   * @param type The packet class to expect
   * @param frame The frame to read
   * @returns The packet
   */
  public static parseAs<T extends IncomingPacket>(
    type: (abstract new (...args: never[]) => T) & { readonly name: string },
    frame: string,
  ): T {
    const packet = PacketFactory.parse(frame)
    if (!(packet instanceof type)) {
      throw new ProtocolError(
        `${packet.header} is not a ${type.name}`,
        'PACKET_TYPE',
      )
    }
    return packet
  }

  /**
   * Creates an outgoing packet
   * @param type The packet class to create
   * @param fields The packet's fields and room
   * @returns The packet
   */
  public static create<T extends OutgoingPacket>(
    type: new () => T,
    ...[fields]: PacketArgs<T>
  ): T {
    return Object.assign(new type(), fields)
  }

  /**
   * Creates a raw XT packet
   * @param header The header of the packet
   * @param room The target room
   * @returns The packet
   */
  public static raw(header: string, room?: number): RawOutgoing {
    return new RawOutgoing(header, room)
  }

  /**
   * Parses a frame
   * @param frame The frame to parse
   * @returns The parsed message
   */
  private static message(frame: string): Message {
    switch (frame.charAt(0)) {
      case '%':
        return XtMessage.parse(frame)
      case '<':
        return XmlMessage.parse(frame)
      case '{':
        return JsonMessage.parse(frame)
      default:
        throw new ProtocolError('Unknown frame format', 'UNKNOWN_FORMAT')
    }
  }
}
