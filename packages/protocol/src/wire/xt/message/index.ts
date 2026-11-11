import { ProtocolError } from '#protocol/error'
import { Message } from '#protocol/wire/message'

/**
 * The XT separator
 */
const SEPARATOR = '%'

/**
 * An XT message
 * @class
 */
export class XtMessage extends Message {
  /**
   * The packet format of the message
   */
  public readonly format = 'xt'

  /**
   * The remaining arguments
   */
  public readonly args: readonly string[]

  /**
   * Creates a new XT message
   * @param header What the message is
   * @param room The message's room
   * @param args The remaining arguments
   */
  public constructor(header: string, room: number, args: readonly string[]) {
    super(header, room)
    this.args = args
  }

  /**
   * Parses a client frame
   * @param frame The frame to parse
   * @returns The parsed message
   */
  public static parse(frame: string): XtMessage {
    if (
      frame.length < 2 ||
      !frame.startsWith(SEPARATOR) ||
      !frame.endsWith(SEPARATOR)
    ) {
      throw new ProtocolError('Not an XT message', 'XT_SYNTAX')
    }
    const [handler, _extension, header, room, ...args] = frame
      .slice(1, -1)
      .split(SEPARATOR)
    if (handler !== 'xt') {
      throw new ProtocolError('Unknown XT handler', 'XT_SYNTAX')
    }
    if (header === undefined || room === undefined) {
      throw new ProtocolError('XT message is missing its header', 'XT_SYNTAX')
    }
    return new XtMessage(header, Message.room(room, 'XT_SYNTAX'), args)
  }

  /**
   * Builds a server frame
   * @param header What the message is
   * @param room The room to send the message in
   * @param args The remaining arguments
   * @returns The frame as a string
   */
  public static build(
    header: string,
    room: number,
    args: readonly string[],
  ): string {
    const fields = ['xt', header, String(room), ...args]
    const clash = fields.find((field) => field.includes(SEPARATOR))
    if (clash !== undefined) {
      throw new ProtocolError(`${header}: value contains %`, 'XT_VALUE')
    }
    return SEPARATOR + fields.map((field) => field + SEPARATOR).join('')
  }
}
