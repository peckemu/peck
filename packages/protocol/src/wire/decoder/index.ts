import { ProtocolError } from '#protocol/error'

/**
 * The message terminator
 */
export const FRAME_DELIMITER = 0x00

/**
 * The max frame size in bytes
 */
export const MAX_FRAME_BYTES = 64 * 1024

/**
 * Splits a TCP byte stream into frames
 * @class
 */
export class FrameDecoder {
  /**
   * The UTF-8 decoder
   */
  private readonly decoder = new TextDecoder('utf-8')

  /**
   * The pending frame chunks
   */
  private pending: Uint8Array[] = []

  /**
   * The pending chunk size
   */
  private pendingBytes = 0

  /**
   * The largest frame size
   */
  private readonly maxFrameBytes: number

  /**
   * Creates a new frame decoder
   * @param maxFrameBytes The max frame size
   */
  public constructor(maxFrameBytes = MAX_FRAME_BYTES) {
    this.maxFrameBytes = maxFrameBytes
  }

  /**
   * Adds a chunk from the socket
   * @param chunk The bytes received
   * @returns The frames the chunk completed
   */
  public push(chunk: Uint8Array): string[] {
    const frames: string[] = []
    let start = 0
    let end = chunk.indexOf(FRAME_DELIMITER)
    while (end !== -1) {
      this.hold(chunk.subarray(start, end))
      frames.push(this.decoder.decode(this.take()))
      start = end + 1
      end = chunk.indexOf(FRAME_DELIMITER, start)
    }
    if (start < chunk.length) this.hold(chunk.subarray(start))
    return frames
  }

  /**
   * The pending byte count
   */
  public get buffered(): number {
    return this.pendingBytes
  }

  /**
   * Drops the pending frame
   */
  public reset(): void {
    this.pending = []
    this.pendingBytes = 0
  }

  /**
   * Holds the pending frame
   * @param bytes The bytes to hold
   */
  private hold(bytes: Uint8Array): void {
    if (bytes.length === 0) return
    this.pendingBytes += bytes.length
    if (this.pendingBytes > this.maxFrameBytes) {
      this.reset()
      throw new ProtocolError('Frame is too large', 'FRAME_TOO_LARGE')
    }
    this.pending.push(bytes.slice())
  }

  /**
   * Joins the held chunks
   * @returns The bytes of the frame
   */
  private take(): Uint8Array {
    const parts = this.pending
    const size = this.pendingBytes
    this.reset()
    const [only] = parts
    if (parts.length === 1 && only) return only
    const frame = new Uint8Array(size)
    let offset = 0
    for (const part of parts) {
      frame.set(part, offset)
      offset += part.length
    }
    return frame
  }
}
