import { inject } from '@needle-di/core'
import { WallRepository } from '@peck/database'
import { type Player, WallArt, type WallLook } from '@peck/game'
import { WallParametersIncoming, WallParametersOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Changes how the player's wall looks
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(WallParametersIncoming)
export class WallParametersHandler extends PacketHandler<WallParametersIncoming> {
  /**
   * Keeps walls
   */
  private readonly walls = inject<WallRepository>(WallRepository)

  /**
   * Saves the change
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: WallParametersIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player } = context
    const look = WallArt.read(packet.changes)
    const valid = look !== null && WallParametersHandler.hangs(player, look)

    if (valid) await this.walls.change(player.gameId, look)

    await context.reply<WallParametersOutgoing>(WallParametersOutgoing, {
      room: packet.room,
      result: valid ? 1 : 0,
    })
  }

  /**
   * Checks the player owns the masterpieces
   * @param player The player
   * @param look The change
   * @returns Whether they are
   */
  private static hangs(player: Player, look: WallLook): boolean {
    return (look.masterpieces ?? []).every(({ iid }) => {
      const item = player.denItems.find(({ invIdx }) => invIdx === iid)

      return item?.masterpiece?.approved === true
    })
  }
}
