import { inject } from '@needle-di/core'
import { MovementIncoming, MovementOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { SessionManager } from '#emulator/sessions/manager'

/**
 * Moves the player
 * @class
 */
@Handler(MovementIncoming)
export class MovementHandler extends PacketHandler<MovementIncoming> {
  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Moves the player
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: MovementIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    player.move(packet.points, packet.animation)

    if (!player.shown && player.avatar) return this.sessions.show(session)

    await context.room.send<MovementOutgoing>(
      MovementOutgoing,
      {
        avatars: [
          {
            userId: player.id,
            path: packet.points,
            teleport: packet.immediate,
          },
        ],
        room: packet.room,
      },
      { exceptSelf: true },
    )
  }
}
