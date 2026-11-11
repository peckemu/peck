import { inject } from '@needle-di/core'
import { WallRepository } from '@peck/database'
import { WallSettingsIncoming, WallSettingsOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { SessionManager } from '#emulator/sessions/manager'

/**
 * Sends a wall's access
 * @class
 */
@Throttle({ limit: 10, per: 5_000 })
@Handler(WallSettingsIncoming)
export class WallSettingsHandler extends PacketHandler<WallSettingsIncoming> {
  /**
   * Keeps walls
   */
  private readonly walls = inject<WallRepository>(WallRepository)

  /**
   * The sessions
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Sends the setting
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: WallSettingsIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const online = this.sessions.byUsername(packet.userName)?.player
    const setting = online
      ? online.wallSettings
      : (await this.walls.owner(packet.userName))?.wallSettings

    await context.reply<WallSettingsOutgoing>(WallSettingsOutgoing, {
      room: packet.room,
      setting: setting ?? 0,
    })
  }
}
