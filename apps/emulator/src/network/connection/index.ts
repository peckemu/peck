import { FrameDecoder, FrameEncoder } from '@peck/protocol'
import { type Socket } from 'bun'

import { type Transport } from '#emulator/network/transport'

/**
 * A frame waiting to be written
 */
type Pending = {
  /**
   * The bytes not yet written
   */
  bytes: Uint8Array

  /**
   * The write callback
   */
  readonly resolve: () => void

  /**
   * Called on failure
   */
  readonly reject: (error: Error) => void
}

/**
 * A TCP connection
 * @class
 */
export class Connection implements Transport {
  /**
   * The shared encoder
   */
  private static readonly encoder = new FrameEncoder()

  /**
   * The address of the other end
   */
  public readonly remoteAddress: string

  /**
   * The socket
   */
  private readonly socket: Socket<unknown>

  /**
   * Collects incoming bytes into frames
   */
  private readonly frames: FrameDecoder

  /**
   * The queued frames
   */
  private readonly queue: Pending[] = []

  /**
   * Whether the connection takes no more frames
   */
  private ended = false

  /**
   * The drain callback
   */
  private readonly waiting: (() => void)[] = []

  /**
   * Wraps a socket
   * @param socket The socket
   * @param maxFrameBytes The largest frame it accepts
   */
  public constructor(socket: Socket<unknown>, maxFrameBytes?: number) {
    this.socket = socket
    this.frames = new FrameDecoder(maxFrameBytes)
    this.remoteAddress = socket.remoteAddress
  }

  /**
   * Whether the connection takes no more frames
   * @returns Whether it is closed
   */
  public get closed(): boolean {
    return this.ended
  }

  /**
   * Feeds in a chunk of bytes
   * @param chunk The bytes
   * @returns The frames the chunk completed
   */
  public receive(chunk: Uint8Array): string[] {
    return this.frames.push(chunk)
  }

  /**
   * Queues a frame
   * @param frame The frame
   * @returns Once the frame is written
   */
  public send(frame: string): Promise<void> {
    if (this.ended) return Promise.reject(new Error('Connection is closed'))
    const bytes = Connection.encoder.encode(frame)
    return new Promise((resolve, reject) => {
      this.queue.push({ bytes, resolve, reject })
      if (this.queue.length === 1) this.flush()
    })
  }

  /**
   * Writes the queue to the socket
   */
  public flush(): void {
    let pending = this.queue[0]
    while (pending) {
      const written = this.socket.write(pending.bytes)
      if (written < 0) {
        this.abort()
        return
      }
      if (written < pending.bytes.length) {
        pending.bytes = pending.bytes.subarray(written)
        return
      }
      this.queue.shift()
      pending.resolve()
      pending = this.queue[0]
    }
    this.settle()
  }

  /**
   * Closes the socket
   * @returns Once it is closed
   */
  public async close(): Promise<void> {
    if (this.ended) return
    this.ended = true
    if (this.queue.length > 0) {
      await new Promise<void>((resolve) => {
        this.waiting.push(resolve)
      })
    }
    this.frames.reset()
    this.socket.end()
  }

  /**
   * Drops everything queued
   */
  public abort(): void {
    this.ended = true
    const error = new Error('Connection was lost')
    for (const pending of this.queue.splice(0)) pending.reject(error)
    this.settle()
  }

  /**
   * Wakes anyone waiting on the queue
   */
  private settle(): void {
    for (const resolve of this.waiting.splice(0)) resolve()
  }
}
