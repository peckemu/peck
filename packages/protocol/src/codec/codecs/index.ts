import { type FormatCodec, type WriteTarget } from '#protocol/codec/format'
import { JsonCodec } from '#protocol/codec/json'
import { type Schema } from '#protocol/codec/schema'
import { XmlCodec } from '#protocol/codec/xml'
import { XtCodec } from '#protocol/codec/xt'
import { JsonMessage } from '#protocol/wire/json/message'
import { type Message, type PacketFormat } from '#protocol/wire/message'
import { XmlMessage } from '#protocol/wire/xml/message'
import { XtMessage } from '#protocol/wire/xt/message'

/**
 * The packet codecs
 * @class
 */
export class Codecs {
  /**
   * The XT codec
   */
  private static readonly xt = new XtCodec()

  /**
   * The XML codec
   */
  private static readonly xml = new XmlCodec()

  /**
   * The JSON codec
   */
  private static readonly json = new JsonCodec()

  /**
   * Gets a format's codec
   * @param format The packet format
   * @returns The codec
   */
  public static get(format: PacketFormat): FormatCodec<Message> {
    return Codecs[format]
  }

  /**
   * Reads a message's fields
   * @param message The message to read
   * @param schema The message schema
   * @returns The message fields
   */
  public static read(
    message: Message,
    schema: Schema,
  ): Record<string, unknown> {
    if (message instanceof XtMessage) return Codecs.xt.read(message, schema)
    if (message instanceof XmlMessage) return Codecs.xml.read(message, schema)
    if (message instanceof JsonMessage) return Codecs.json.read(message, schema)
    throw new TypeError(`No codec for ${message.format}`)
  }

  /**
   * Writes a message
   * @param format The packet format
   * @param target The target
   * @returns The message as text
   */
  public static write(format: PacketFormat, target: WriteTarget): string {
    return Codecs.get(format).write(target)
  }
}
