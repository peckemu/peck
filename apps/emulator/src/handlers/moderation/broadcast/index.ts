import { inject, injectable } from '@needle-di/core'
import { ClusterEvents, type StaffEvent } from '@peck/cluster'
import { type Logger } from '@peck/logger'
import { AdminMessageOutgoing } from '@peck/packets'

import { SessionManager } from '#emulator/sessions/manager'
import { LoggerToken } from '#emulator/tokens'

/**
 * Shows staff messages to every player
 * @class
 */
@injectable()
export class StaffBroadcasts {
  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Events between nodes
   */
  private readonly events = inject<ClusterEvents<StaffEvent>>(ClusterEvents)

  /**
   * The logger
   */
  private readonly logger = inject<Logger>(LoggerToken)

  /**
   * Starts listening
   */
  public async start(): Promise<void> {
    await this.events.listen((event) => {
      if (event.type !== 'staff-broadcast') return

      void this.show(event.text, event.system).catch((error: unknown) => {
        this.logger.warn({ err: error, type: event.type }, 'broadcast failed')
      })
    })
  }

  /**
   * Shows a message to every player here
   * @param text The message
   * @param system Whether it is a system message
   */
  public async show(text: string, system: boolean): Promise<void> {
    const packet = system
      ? AdminMessageOutgoing.system(text)
      : AdminMessageOutgoing.broadcast(text)

    const sends = [...this.sessions]
      .filter((session) => session.player !== null)
      .map((session) => session.send<AdminMessageOutgoing>(packet))
    await Promise.allSettled(sends)
  }
}
