import { inject } from '@needle-di/core'
import { type Player } from '@peck/game'
import { DenPhantomIncoming, DenPhantomOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { SessionManager } from '#emulator/sessions/manager'

/**
 * Turns the player into a phantom or back
 * @class
 */
@Throttle({ limit: 10, per: 5_000 })
@Handler(DenPhantomIncoming)
export class DenPhantomHandler extends PacketHandler<DenPhantomIncoming> {
  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Shows the den the change
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DenPhantomIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player } = context

    const refusal = this.refusal(player)
    if (refusal !== null) {
      context.log.info({ refusal }, 'phantom refused')
      return
    }

    await this.sessions.broadcast<DenPhantomOutgoing>(
      player.roomId,
      DenPhantomOutgoing.of(player.roomId, player.id, packet.phantom),
    )
  }

  /**
   * Finds why the player can't change
   * @param player The player
   * @returns The reason, or null
   */
  private refusal(player: Player): string | null {
    if (!player.room) return 'not in a room'
    if (!player.room.template.den) return 'not in a den'

    return null
  }
}
