import { Container, inject, injectable } from '@needle-di/core'
import {
  Guard,
  HandlerRegistry,
  isPublic,
  type Middleware,
  type PacketHandler,
} from '@peck/plugins'
import { PacketFactory, ProtocolError } from '@peck/protocol'

import { HandlerContext } from '#emulator/dispatch/context'
import { type Session } from '#emulator/sessions/session'
import { SessionManager } from '#emulator/sessions/manager'

/**
 * What happened to a frame
 */
export type DispatchResult = 'handled' | 'unhandled' | 'refused' | 'failed'

/**
 * Dispatches packets to their handlers
 * @class
 */
@injectable()
export class Dispatcher {
  /**
   * Builds the handlers and what they need
   */
  private readonly container = inject<Container>(Container)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * The handlers to use
   */
  private readonly handlers = inject<HandlerRegistry>(HandlerRegistry)

  /**
   * The middleware
   */
  private readonly middleware: Middleware[] = []

  /**
   * Adds middleware
   * @param middleware The middleware
   * @returns The dispatcher
   */
  public use(middleware: Middleware): this {
    this.middleware.push(middleware)
    return this
  }

  /**
   * Handles one frame from a session
   * @param session The sending session
   * @param frame The frame
   * @returns What happened to it
   */
  public async dispatch(
    session: Session,
    frame: string,
  ): Promise<DispatchResult> {
    session.touch()
    const packet = PacketFactory.parse(frame)
    const type = this.handlers.resolve(packet)
    if (!type) return 'unhandled'
    if (!session.authenticated && !isPublic(type)) return 'refused'
    const context = new HandlerContext(session, packet, this.sessions)
    for (const guard of Guard.of(type)) {
      const reason = guard.check(context)
      if (reason !== null) return 'refused'
    }
    try {
      await this.run(context, 0, async () => {
        await this.container.get<PacketHandler>(type).handle(packet, context)
      })
      return 'handled'
    } catch (error) {
      if (error instanceof ProtocolError) throw error
      session.log.error({ err: error, handler: type.name }, 'handler failed')
      return 'failed'
    }
  }

  /**
   * Runs the middleware and handler
   * @param context The context of the packet
   * @param index The middleware to run next
   * @param handle Runs the handler
   */
  private async run(
    context: HandlerContext,
    index: number,
    handle: () => Promise<void>,
  ): Promise<void> {
    const middleware = this.middleware[index]
    if (!middleware) {
      await handle()
      return
    }
    await middleware(context, () => this.run(context, index + 1, handle))
  }
}
