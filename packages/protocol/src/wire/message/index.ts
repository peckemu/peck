import { ProtocolError, type ProtocolErrorCode } from '#protocol/error'
import { Numbers } from '#protocol/wire/numbers'

/**
 * How SmartFox writes a message
 */
export type PacketFormat = 'xt' | 'xml' | 'json'

/**
 * A frame from the client
 * @class
 */
export abstract class Message {
  /**
   * The packet format of the message
   */
  public abstract readonly format: PacketFormat

  /**
   * What the frame is
   */
  public readonly header: string

  /**
   * The message's room
   */
  public readonly room: number

  /**
   * Creates a new message
   * @param header What the frame is
   * @param room The message's room
   */
  public constructor(header: string, room: number) {
    this.header = header
    this.room = room
  }

  /**
   * Parses a room number
   * @param text The room number as text
   * @param code The error code
   * @returns The room number
   */
  protected static room(text: string, code: ProtocolErrorCode): number {
    const room = Numbers.integer(text)
    if (room === null) throw new ProtocolError('Invalid room', code)
    return room
  }
}
