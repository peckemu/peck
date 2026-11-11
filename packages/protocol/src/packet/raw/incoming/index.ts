import { ProtocolError } from '#protocol/error'
import { IncomingPacket } from '#protocol/packet/incoming'
import { type Message } from '#protocol/wire/message'
import { XtMessage } from '#protocol/wire/xt/message'
import { XtReader } from '#protocol/wire/xt/reader'

/**
 * An unknown packet
 * @class
 */
export class RawIncoming extends IncomingPacket {
  /**
   * The source message
   */
  public readonly message: Message

  /**
   * The reader over the XT arguments
   */
  private readonly reader: XtReader | null

  /**
   * Creates a raw packet from a message
   * @param message The source message
   */
  public constructor(message: Message) {
    super()
    Object.assign(this, { header: message.header, room: message.room })
    this.message = message
    this.reader =
      message instanceof XtMessage
        ? new XtReader(message.header, message.args)
        : null
  }

  /**
   * Reads the next XT argument as a string
   * @param field The name of the field
   * @returns The string read
   */
  public string(field?: string): string {
    return this.xt().string(field)
  }

  /**
   * Reads the next XT argument as an integer
   * @param field The name of the field
   * @returns The integer read
   */
  public int(field?: string): number {
    return this.xt().int(field)
  }

  /**
   * Reads the next XT argument as a number
   * @param field The name of the field
   * @returns The number read
   */
  public number(field?: string): number {
    return this.xt().number(field)
  }

  /**
   * Reads the next XT argument as a boolean
   * @param field The name of the field
   * @returns The boolean read
   */
  public boolean(field?: string): boolean {
    return this.xt().boolean(field)
  }

  /**
   * Reads every XT argument left
   * @returns The arguments as strings
   */
  public rest(): string[] {
    return this.xt().rest()
  }

  /**
   * Retrieves the XT reader
   * @returns The reader over the XT arguments
   */
  private xt(): XtReader {
    if (!this.reader) {
      throw new ProtocolError(
        `${this.header} is not an XT packet`,
        'PACKET_FIELD',
      )
    }
    return this.reader
  }
}
