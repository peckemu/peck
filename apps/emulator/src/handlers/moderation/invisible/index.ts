import { inject } from '@needle-di/core'
import { type Player } from '@peck/game'
import { InvisibleIncoming, InvisibleOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { BuddyService } from '../../../cluster/buddies/index.ts'
import { type HandlerContext } from '../../../dispatch/context/index.ts'
import { ModerationTools } from '../tools/index.ts'
import { type Session } from '../../../sessions/session/index.ts'
import { SessionManager } from '../../../sessions/manager/index.ts'

/**
 * Hides or shows a moderator
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(InvisibleIncoming)
export class InvisibleHandler extends PacketHandler<InvisibleIncoming> {
  /**
   * The staff tools
   */
  private readonly tools = inject<ModerationTools>(ModerationTools)

  /**
   * The sessions
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * The buddy service
   */
  private readonly buddies = inject<BuddyService>(BuddyService)

  /**
   * Hides or shows the moderator
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: InvisibleIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    if (!(await this.tools.allowed(player))) {
      context.log.warn('invisible mode refused')
      return
    }

    if (packet.visible === true) await this.appear(session, player, packet)
    else await this.vanish(session, player)

    await this.tools.hidden(player)
    await this.buddies.place(session)
    await session.send<InvisibleOutgoing>(
      InvisibleOutgoing.of(packet.room, player.invisible),
    )
  }

  /**
   * Hides the moderator
   * @param session The moderator's session
   * @param player The moderator
   */
  private async vanish(session: Session, player: Player): Promise<void> {
    await this.sessions.hide(session)

    player.invisible = true
  }

  /**
   * Shows the moderator
   * @param session The moderator's session
   * @param player The moderator
   * @param packet The packet
   */
  private async appear(
    session: Session,
    player: Player,
    packet: InvisibleIncoming,
  ): Promise<void> {
    player.invisible = false
    if (packet.x !== undefined && packet.y !== undefined) {
      player.position = { x: packet.x, y: packet.y }
    }
    if (packet.animation !== undefined) player.animation = packet.animation

    if (player.room) await this.sessions.show(session)
  }
}
