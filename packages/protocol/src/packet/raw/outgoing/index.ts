import { OutgoingPacket } from '#protocol/packet/outgoing'
import { XtMessage } from '#protocol/wire/xt/message'
import { XtWriter } from '#protocol/wire/xt/writer'

/**
 * A raw XT packet
 * @class
 */
export class RawOutgoing extends OutgoingPacket {
  /**
   * The header of the packet
   */
  public readonly header: string

  /**
   * The target room
   */
  public override readonly room: number

  /**
   * The argument writer
   */
  private readonly writer: XtWriter

  /**
   * Creates a raw XT packet
   * @param header The header of the packet
   * @param room The target room
   */
  public constructor(header: string, room = -1) {
    super()
    this.header = header
    this.room = room
    this.writer = new XtWriter(header)
  }

  /**
   * Adds a string argument
   * @param value The string to add
   * @returns The packet
   */
  public string(value: string): this {
    this.writer.string(value)
    return this
  }

  /**
   * Adds an integer argument
   * @param value The integer to add
   * @returns The packet
   */
  public int(value: number): this {
    this.writer.int(value)
    return this
  }

  /**
   * Adds a number argument
   * @param value The number to add
   * @returns The packet
   */
  public number(value: number): this {
    this.writer.number(value)
    return this
  }

  /**
   * Adds a boolean argument
   * @param value The boolean to add
   * @returns The packet
   */
  public boolean(value: boolean): this {
    this.writer.boolean(value)
    return this
  }

  /**
   * Writes the packet as an XT frame
   * @returns The frame
   */
  public override toString(): string {
    return XtMessage.build(this.header, this.room, this.writer.values)
  }

  /**
   * Lists the header
   * @returns The packet as a plain object
   */
  public override toJSON(): Record<string, unknown> {
    return { header: this.header, room: this.room, args: this.writer.values }
  }
}
