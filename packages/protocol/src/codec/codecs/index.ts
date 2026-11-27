import { type FormatCodec, type WriteTarget } from '../format/index.ts'
import { JsonCodec } from '../json/index.ts'
import { type Schema } from '../schema/index.ts'
import { XmlCodec } from '../xml/index.ts'
import { XtCodec } from '../xt/index.ts'
import { JsonMessage } from '../../wire/json/message/index.ts'
import { type Message, type PacketFormat } from '../../wire/message/index.ts'
import { XmlMessage } from '../../wire/xml/message/index.ts'
import { XtMessage } from '../../wire/xt/message/index.ts'

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
