import {
  DecoderError,
  type HandlerContext,
  SimpleInboundHandler,
} from '@netifyjs/netify'
import { ProtocolError, SocketPolicy } from '@peck/protocol'

import { type Dispatcher } from '../../dispatch/dispatcher/index.ts'
import { type Limits } from '../../limits/index.ts'
import { Connection } from '../connection/index.ts'
import { RateLimiter } from '../limiter/index.ts'
import { type SessionManager } from '../../sessions/manager/index.ts'
import { type Session } from '../../sessions/session/index.ts'

/**
 * Turns a player's frames into packets for the dispatcher
 * @class
 */
export class GameHandler extends SimpleInboundHandler<string> {
  /**
   * Every open session
   */
  private readonly sessions: SessionManager

  /**
   * Runs the packet handlers
   */
  private readonly dispatcher: Dispatcher

  /**
   * How much a client is allowed to get away with
   */
  private readonly limits: Limits

  /**
   * Stops one client flooding the server
   */
  private readonly limiter: RateLimiter

  /**
   * This connection's session, or null
   */
  private session: Session | null = null

  /**
   * Hangs up on a client that never logs in
   */
  private loginTimer: Timer | null = null

  /**
   * Packets the dispatcher turned down so far
   */
  private refused = 0

  /**
   * @param sessions where sessions are kept
   * @param dispatcher what runs each packet
   * @param limits the server's limits
   */
  public constructor(
    sessions: SessionManager,
    dispatcher: Dispatcher,
    limits: Limits,
  ) {
    super()
    this.sessions = sessions
    this.dispatcher = dispatcher
    this.limits = limits
    this.limiter = new RateLimiter(limits.packetRate, limits.packetBurst)
  }

  /**
   * Opens a session and starts the login clock
   * @param context where it sits in the pipeline
   */
  public override channelActive(context: HandlerContext): void {
    const session = this.sessions.open(new Connection(context.channel))
    this.session = session

    this.loginTimer = setTimeout(() => {
      if (!session.authenticated) {
        void this.drop(session, 'did not log in in time')
      }
    }, this.limits.loginTimeoutMs)
  }

  /**
   * Forgets the session once the socket's gone
   */
  public override channelInactive(): void {
    if (this.loginTimer) clearTimeout(this.loginTimer)

    if (this.session) this.sessions.remove(this.session)
    this.session = null
  }

  /**
   * Drops a client that sends something it can't read
   * @param _context where it sits in the pipeline
   * @param error what went wrong
   */
  public override async exceptionCaught(
    _context: HandlerContext,
    error: unknown,
  ): Promise<void> {
    const session = this.session
    if (!session) return

    if (error instanceof DecoderError || error instanceof ProtocolError) {
      await this.drop(session, 'sent a bad frame', error)
      return
    }

    session.log.error({ err: error }, 'could not handle a frame')
  }

  /**
   * Only takes frames as text
   * @param message whatever came up the pipeline
   */
  protected accepts(message: unknown): message is string {
    return typeof message === 'string'
  }

  /**
   * Answers the socket policy or dispatches the packet
   * @param _context where it sits in the pipeline
   * @param frame one frame of text
   */
  protected async messageReceived(
    _context: HandlerContext,
    frame: string,
  ): Promise<void> {
    const session = this.session
    if (!session || session.closed) return

    if (!this.limiter.take()) {
      await this.drop(session, 'sent too many packets')
      return
    }

    if (SocketPolicy.isRequest(frame)) {
      await session.write(SocketPolicy.RESPONSE)
      return
    }

    const result = await this.dispatcher.dispatch(session, frame)
    if (result === 'refused' && ++this.refused > this.limits.maxRefused) {
      await this.drop(session, 'sent too many refused packets')
    }
  }

  /**
   * Logs why and hangs up
   * @param session who broke the rules
   * @param reason what they did
   * @param error what was behind it
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
