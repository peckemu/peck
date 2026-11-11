import { inject } from '@needle-di/core'
import { DenRepository } from '@peck/database'
import { DenRules, RoomManager } from '@peck/game'
import { DenEmptyIncoming, DenEmptyOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { SessionManager } from '#emulator/sessions/manager'

/**
 * Empties the player's den
 * @class
 */
@Throttle({ limit: 3, per: 5_000 })
@Handler(DenEmptyIncoming)
export class DenEmptyHandler extends PacketHandler<DenEmptyIncoming> {
  /**
   * Saves dens
   */
  private readonly dens = inject<DenRepository>(DenRepository)

  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Puts every placed item back in the drawer
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DenEmptyIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    DenRules.clear(player)
    await this.dens.empty(player.gameId)

    await session.send<DenEmptyOutgoing>(DenEmptyOutgoing.of(packet.room))

    const den = this.rooms.instancesOf(`den${player.username}`)[0]
    if (!den) return

    await this.sessions.broadcast<DenEmptyOutgoing>(
      den.id,
      DenEmptyOutgoing.of(den.id),
      session,
    )
  }
}
