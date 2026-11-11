import { inject, injectable } from '@needle-di/core'
import { ProtocolError, SocketPolicy } from '@peck/protocol'
import { KeepAlive } from '@peck/shared'
import { type Socket, type TCPSocketListener } from 'bun'
import { type Logger } from '@peck/logger'

import { Connection } from '#emulator/network/connection'
import { RateLimiter } from '#emulator/network/limiter'
import { Dispatcher } from '#emulator/dispatch/dispatcher'
import { type Session } from '#emulator/sessions/session'
import { SessionManager } from '#emulator/sessions/manager'
import { type Config } from '#emulator/config'
import { ConfigToken, LoggerToken } from '#emulator/tokens'

/**
 * The socket data
 */
type SocketData = {
  /**
   * The socket's connection
   */
  readonly connection: Connection

  /**
   * The session on it
   */
  readonly session: Session

  /**
   * How fast it may send packets
   */
  readonly limiter: RateLimiter

  /**
   * Times out a slow login
   */
  readonly loginTimer: Timer

  /**
   * The chunks being handled
   */
  reading: Promise<void>

  /**
   * How many chunks are waiting
   */
  queued: number

  /**
   * How many of its packets were refused
   */
  refused: number
}

/**
 * The TCP server
 * @class
 */
@injectable()
export class Server {
  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Runs the handlers
   */
  private readonly dispatcher = inject<Dispatcher>(Dispatcher)

  /**
   * Where to log
   */
  private readonly logger = inject<Logger>(LoggerToken)

  /**
   * Where to listen
   */
  private readonly config = inject<Config>(ConfigToken)

  /**
   * The connections by address
   */
  private readonly addresses = new Map<string, number>()

  /**
   * The listener
   */
  private listener: TCPSocketListener<SocketData | undefined> | null = null

  /**
   * The port it listens on
   */
  public get port(): number {
    return this.listener?.port ?? this.config.port
  }

  /**
   * Starts listening
   */
  public start(): void {
    this.listener = Bun.listen<SocketData | undefined>({
      hostname: this.config.host,
      port: this.config.port,
      socket: {
        open: (socket) => {
          this.open(socket)
        },
        data: (socket, chunk) => {
          this.queue(socket, chunk)
        },
        drain: (socket) => {
          socket.data?.connection.flush()
        },
        timeout: (socket) => {
          socket.end()
        },
        close: (socket) => {
          this.close(socket)
        },
        error: (socket, error) => {
          ;(socket.data?.session.log ?? this.logger).warn(
            { err: error },
            'socket error',
          )
        },
      },
    })
    this.logger.info({ host: this.config.host, port: this.port }, 'listening')
  }

  /**
   * Stops the server
   */
  public stop(): void {
    this.listener?.stop(true)
    this.listener = null
  }

  /**
   * Opens a session for a socket
   * @param socket The socket
   */
  private open(socket: Socket<SocketData | undefined>): void {
    const { limits } = this.config
    const address = socket.remoteAddress
    const fromAddress = this.addresses.get(address) ?? 0
    if (
      this.sessions.size >= limits.maxConnections ||
      fromAddress >= limits.maxConnectionsPerAddress
    ) {
      this.logger.warn({ address }, 'too many connections')
      socket.end()
      return
    }
    this.addresses.set(address, fromAddress + 1)
    socket.timeout(KeepAlive.TimeoutMs / 1000)
    const connection = new Connection(socket, limits.maxFrameBytes)
    const session = this.sessions.open(connection)
    socket.data = {
      connection,
      session,
      limiter: new RateLimiter(limits.packetRate, limits.packetBurst),
      loginTimer: setTimeout(() => {
        if (!session.authenticated) {
          void this.drop(session, 'did not log in in time')
        }
      }, limits.loginTimeoutMs),
      reading: Promise.resolve(),
      queued: 0,
      refused: 0,
    }
  }

  /**
   * Queues a chunk
   * @param socket The socket
   * @param chunk The bytes
   */
  private queue(
    socket: Socket<SocketData | undefined>,
    chunk: Uint8Array,
  ): void {
    const { data } = socket
    if (!data) return
    if (data.queued >= this.config.limits.maxQueuedChunks) {
      void this.drop(data.session, 'sent faster than it could be handled')
      return
    }
    data.queued++
    const bytes = new Uint8Array(chunk)
    data.reading = data.reading.then(async () => {
      await this.receive(data, bytes)
      data.queued--
    })
  }

  /**
   * Dispatches each frame in a chunk
   * @param data The socket's connection and session
   * @param chunk The bytes
   */
  private async receive(data: SocketData, chunk: Uint8Array): Promise<void> {
    const { connection, session } = data
    try {
      for (const frame of connection.receive(chunk)) {
        if (!data.limiter.take()) {
          await this.drop(session, 'sent too many packets')
          return
        }
        if (SocketPolicy.isRequest(frame)) {
          await session.write(SocketPolicy.RESPONSE)
          continue
        }
        const result = await this.dispatcher.dispatch(session, frame)
        if (
          result === 'refused' &&
          ++data.refused > this.config.limits.maxRefused
        ) {
          await this.drop(session, 'sent too many refused packets')
          return
        }
      }
    } catch (error) {
      if (error instanceof ProtocolError) {
        await this.drop(session, 'sent a bad frame', error)
        return
      }
      session.log.error({ err: error }, 'could not handle a chunk')
    }
  }

  /**
   * Cleans up a closed socket
   * @param socket The socket
   */
  private close(socket: Socket<SocketData | undefined>): void {
    const { data } = socket
    if (!data) return
    clearTimeout(data.loginTimer)
    data.connection.abort()
    this.sessions.remove(data.session)
    const address = socket.remoteAddress
    const left = (this.addresses.get(address) ?? 1) - 1
    if (left > 0) this.addresses.set(address, left)
    else this.addresses.delete(address)
  }

  /**
   * Drops a rule breaking session
   * @param session The session
   * @param reason The reason
   * @param error The error behind it
   */
  private async drop(
    session: Session,
    reason: string,
    error?: unknown,
  ): Promise<void> {
    session.log.warn({ reason, err: error }, 'dropped')
    await session.close()
  }
}
