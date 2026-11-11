import { ProtocolError } from '#protocol/error'
import { Message } from '#protocol/wire/message'

/**
 * Checks for a plain object
 */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * A JSON extension message
 * @class
 */
export class JsonMessage extends Message {
  /**
   * The packet format of the message
   */
  public readonly format = 'json'

  /**
   * The parameters of the message
   */
  public readonly params: Readonly<Record<string, unknown>>

  /**
   * Creates a new JSON message
   * @param header What the message is
   * @param room The message's room
   * @param params The parameters of the message
   */
  public constructor(
    header: string,
    room: number,
    params: Readonly<Record<string, unknown>>,
  ) {
    super(header, room)
    this.params = params
  }

  /**
   * Parses a client frame
   * @param frame The frame to parse
   * @returns The parsed message
   */
  public static parse(frame: string): JsonMessage {
    let value: unknown
    try {
      value = JSON.parse(frame)
    } catch (error) {
      throw new ProtocolError('Invalid JSON', 'JSON_SYNTAX', error)
    }
    const body = isRecord(value) ? value['b'] : undefined
    if (!isRecord(body) || typeof body['c'] !== 'string') {
      throw new ProtocolError('Not a JSON message', 'JSON_SYNTAX')
    }
    const { c: header, r: room, p: params } = body
    if (room !== undefined && !Number.isSafeInteger(room)) {
      throw new ProtocolError('Invalid room', 'JSON_SYNTAX')
    }
    if (params !== undefined && !isRecord(params)) {
      throw new ProtocolError('JSON params are not an object', 'JSON_SYNTAX')
    }
    return new JsonMessage(
      header,
      typeof room === 'number' ? room : -1,
      params ?? {},
    )
  }

  /**
   * Builds a server frame
   * @param header What the message is
   * @param room The room to send the message in
   * @param params The parameters of the message
   * @returns The frame as a string
   */
  public static build(
    header: string,
    room: number,
    params: Readonly<Record<string, unknown>>,
  ): string {
    return JSON.stringify({
      t: 'xt',
      b: { r: room, o: { _cmd: header, ...params } },
    })
  }
}
