import { inject } from '@needle-di/core'
import { MinigameRepository } from '@peck/database'
import { MinigameCatalogue } from '@peck/game'
import {
  MinigameLeaderboardIncoming,
  MinigameLeaderboardOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Sends a minigame's leaderboards
 * @class
 */
@Handler(MinigameLeaderboardIncoming)
export class MinigameLeaderboardHandler extends PacketHandler<MinigameLeaderboardIncoming> {
  /**
   * Every minigame
   */
  private readonly games = inject<MinigameCatalogue>(MinigameCatalogue)

  /**
   * Minigame stats
   */
  private readonly repository = inject<MinigameRepository>(MinigameRepository)

  /**
   * Sends the leaderboards
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: MinigameLeaderboardIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const game = this.games.get(packet.gameDefId)
    if (!game || game.leaderboardUserVarRef <= 0) {
      return session.send<MinigameLeaderboardOutgoing>(
        MinigameLeaderboardOutgoing.none(packet.room),
      )
    }

    const buddies = [...player.buddies].map(({ gameId }) => gameId)
    const boards = await this.repository.boards(
      player.gameId,
      game.defId,
      buddies,
    )

    await session.send<MinigameLeaderboardOutgoing>(
      MinigameLeaderboardOutgoing.of(packet.room, game.defId, player.username, [
        boards.allTime,
        boards.thisWeek,
        boards.buddies,
      ]),
    )
  }
}
