import { inject } from '@needle-di/core'
import { DenMasterpiecesIncoming, DenMasterpiecesOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PlayerFinder } from '#emulator/sessions/finder'

/**
 * Lists the masterpieces placed in a den
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(DenMasterpiecesIncoming)
export class DenMasterpiecesHandler extends PacketHandler<DenMasterpiecesIncoming> {
  /**
   * Finds players
   */
  private readonly finder = inject<PlayerFinder>(PlayerFinder)

  /**
   * Sends the den's masterpieces
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DenMasterpiecesIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const owner = await this.finder.find(packet.userName)
    const own = owner?.gameId === context.player.gameId

    const items = (owner?.denItems ?? []).filter(
      ({ categoryId, masterpiece }) =>
        categoryId !== 0 && masterpiece && (own || masterpiece.approved),
    )

    await context.session.send<DenMasterpiecesOutgoing>(
      DenMasterpiecesOutgoing.of(packet.room, items),
    )
  }
}
