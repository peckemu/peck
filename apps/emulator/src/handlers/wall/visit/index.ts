import { inject } from '@needle-di/core'
import { WallRepository } from '@peck/database'
import { WallVisitIncoming, WallVisitOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Counts a visit to someone's wall
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(WallVisitIncoming)
export class WallVisitHandler extends PacketHandler<WallVisitIncoming> {
  /**
   * Keeps walls
   */
  private readonly walls = inject<WallRepository>(WallRepository)

  /**
   * Counts the visit
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: WallVisitIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player } = context
    const owner = await this.walls.owner(packet.userName)
    const access = owner
      ? await this.walls.access(player.gameId, owner.gameId)
      : null
    const counted =
      !!owner && owner.gameId !== player.gameId && access?.read === true

    if (counted) await this.walls.visit(owner.gameId)

    await context.reply<WallVisitOutgoing>(WallVisitOutgoing, {
      room: packet.room,
      result: counted ? 1 : 0,
    })
  }
}
