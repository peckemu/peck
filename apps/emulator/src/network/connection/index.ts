import { type Channel } from '@netifyjs/netify'

import { type Transport } from '../transport/index.ts'

/**
 * A player's TCP connection
 * @class
 */
export class Connection implements Transport {
  /**
   * Where the player is connecting from
   */
  public readonly remoteAddress: string

  /**
   * Netify's side of it
   */
  private readonly channel: Channel

  /**
   * The newest write, so a close waits for it
   */
  private last: Promise<void> = Promise.resolve()

  /**
   * Set once a close has started
   */
  private ended = false

  /**
   * @param channel the channel the player is on
   */
  public constructor(channel: Channel) {
    this.channel = channel
    this.remoteAddress = channel.remoteAddress
  }

  /**
   * Whether it's stopped taking frames
   */
  public get closed(): boolean {
    return this.ended || !this.channel.isActive
  }

  /**
   * Sends one frame
   * @param frame text to send, without the NUL
   */
  public send(frame: string): Promise<void> {
    if (this.closed) return Promise.reject(new Error('Connection is closed'))

    const written = this.channel.writeAndFlush(frame)
    this.last = written.catch(() => undefined)
    return written
  }

  /**
   * Hangs up once anything already sent has gone out
   */
  public async close(): Promise<void> {
    if (this.ended) return

    this.ended = true
    await this.last
    await this.channel.close()
  }
}
