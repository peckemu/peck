import { inject } from '@needle-di/core'
import { WallRepository } from '@peck/database'
import { WallSettingsSetIncoming, WallSettingsSetOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * The settings
 */
const SETTINGS: ReadonlySet<number> = new Set([0, 1, 2])

/**
 * Sets the player's wall access
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(WallSettingsSetIncoming)
export class WallSettingsSetHandler extends PacketHandler<WallSettingsSetIncoming> {
  /**
   * Keeps walls
   */
  private readonly walls = inject<WallRepository>(WallRepository)

  /**
   * Saves the setting
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: WallSettingsSetIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player } = context
    const valid = SETTINGS.has(packet.setting)

    if (valid) {
      await this.walls.setSettings(player.gameId, packet.setting)
      player.wallSettings = packet.setting
    }

    await context.reply<WallSettingsSetOutgoing>(WallSettingsSetOutgoing, {
      room: packet.room,
      result: valid ? 1 : 0,
    })
  }
}
