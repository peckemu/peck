import { inject, injectable } from '@needle-di/core'
import {
  type Channel,
  DelimiterBasedFrameDecoder,
  ServerBootstrap,
  type ServerChannel,
  StringDecoder,
} from '@netifyjs/netify'
import { type Logger } from '@peck/logger'
import { KeepAlive } from '@peck/shared'

import { type Config } from '../../config/index.ts'
import { Dispatcher } from '../../dispatch/dispatcher/index.ts'
import { GameHandler } from '../game/index.ts'
import { Terminator } from '../terminator/index.ts'
import { SessionManager } from '../../sessions/manager/index.ts'
import { ConfigToken, LoggerToken } from '../../tokens/index.ts'

/**
 * The game's TCP server
 * @class
 */
@injectable()
export class Server {
  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Runs the packet handlers
   */
  private readonly dispatcher = inject<Dispatcher>(Dispatcher)

  /**
   * Where startup and errors get logged
   */
  private readonly logger = inject<Logger>(LoggerToken)

  /**
   * Host, port and limits
   */
  private readonly config = inject<Config>(ConfigToken)

  /**
   * The listening socket, or null
   */
  private channel: ServerChannel | null = null

  /**
   * Port it's listening on
   */
  public get port(): number {
    return this.channel?.port ?? this.config.port
  }

  /**
   * Starts taking connections
   */
  public async start(): Promise<void> {
    const { limits } = this.config

    this.channel = await new ServerBootstrap()
      .options({
        /**
         * Players allowed on at once
         */
        maxConnections: limits.maxConnections,
        /**
         * Players allowed from one address
         */
        maxConnectionsPerAddress: limits.maxConnectionsPerAddress,
      })
      .childOptions({
        /**
         * Hangs up on a client that goes quiet
         */
        idleTimeout: KeepAlive.TimeoutMs,
        /**
         * Logs channel trouble with the rest
         */
        logger: this.logger,
      })
      .childHandler((channel: Channel): void => {
        this.build(channel)
      })
      .bind({
        /**
         * Address to listen on
         */
        hostname: this.config.host,
        /**
         * Port to listen on
         */
        port: this.config.port,
      })

    this.logger.info({ host: this.config.host, port: this.port }, 'listening')
  }

  /**
   * Stops listening and closes every connection
   */
  public async stop(): Promise<void> {
    await this.channel?.close()
    this.channel = null
  }

  /**
   * Sets up one player's pipeline
   * @param channel the new connection
   */
  private build(channel: Channel): void {
    const { limits } = this.config

    channel.pipeline
      .addLast<DelimiterBasedFrameDecoder>(
        'frames',
        new DelimiterBasedFrameDecoder({
          /**
           * Biggest frame a client may send
           */
          maxFrameLength: limits.maxFrameBytes,
          /**
           * The client ends every frame with a NUL
           */
          delimiters: DelimiterBasedFrameDecoder.nulDelimiter,
        }),
      )
      .addLast<StringDecoder>('text', new StringDecoder())
      .addLast<Terminator>('terminator', new Terminator())
      .addLast<GameHandler>(
        'game',
        new GameHandler(this.sessions, this.dispatcher, limits),
      )
  }
}
