import { ProtocolError } from '#protocol/error'
import { FRAME_DELIMITER } from '#protocol/wire/decoder'

/**
 * Writes NUL terminated frames
 * @class
 */
export class FrameEncoder {
  /**
   * The UTF-8 encoder
   */
  private readonly encoder = new TextEncoder()

  /**
   * Encodes a packet as a frame
   * @param packet The packet to encode
   * @returns The frame bytes
   */
  public encode(packet: { toString(): string }): Uint8Array {
    const body = this.encoder.encode(packet.toString())
    if (body.includes(FRAME_DELIMITER)) {
      throw new ProtocolError('Frame contains a delimiter', 'FRAME_DELIMITER')
    }
    const frame = new Uint8Array(body.length + 1)
    frame.set(body)
    frame[body.length] = FRAME_DELIMITER
    return frame
  }
}
