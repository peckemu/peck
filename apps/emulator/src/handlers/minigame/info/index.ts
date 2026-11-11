import { inject } from '@needle-di/core'
import { MinigameCatalogue, type MinigameTemplate } from '@peck/game'
import { MinigameInfoIncoming, MinigameInfoOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Describes minigames
 * @class
 */
@Handler(MinigameInfoIncoming)
export class MinigameInfoHandler extends PacketHandler<MinigameInfoIncoming> {
  /**
   * Every minigame
   */
  private readonly games = inject<MinigameCatalogue>(MinigameCatalogue)

  /**
   * Describes the wanted games
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: MinigameInfoIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const games = packet.gameDefIds.flatMap((defId): MinigameTemplate[] => {
      const game = this.games.get(defId)
      return game ? [game] : []
    })

    await context.session.send<MinigameInfoOutgoing>(
      MinigameInfoOutgoing.of(packet.room, games),
    )
  }
}
