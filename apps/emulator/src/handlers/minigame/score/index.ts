import { inject } from '@needle-di/core'
import { MinigameRepository } from '@peck/database'
import { MinigameCatalogue, Minigames, MOST_SCORE } from '@peck/game'
import { MinigameScoreIncoming } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PlayerVariables } from '#emulator/sessions/variables'

/**
 * Keeps a minigame score
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(MinigameScoreIncoming)
export class MinigameScoreHandler extends PacketHandler<MinigameScoreIncoming> {
  /**
   * Every minigame
   */
  private readonly games = inject<MinigameCatalogue>(MinigameCatalogue)

  /**
   * The minigame players
   */
  private readonly minigames = inject<Minigames>(Minigames)

  /**
   * Minigame stats
   */
  private readonly repository = inject<MinigameRepository>(MinigameRepository)

  /**
   * Sets the player's counters
   */
  private readonly variables = inject<PlayerVariables>(PlayerVariables)

  /**
   * Keeps the score
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: MinigameScoreIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const seat = this.minigames.of(player.gameId)
    const game = seat ? this.games.get(seat.gameDefId) : null
    const score = seat ? Minigames.unfoldScore(packet, seat.scoreSerial) : null

    const valid =
      seat !== null &&
      game !== null &&
      score !== null &&
      game.leaderboardUserVarRef > 0 &&
      score.varRef === game.leaderboardUserVarRef &&
      score.gameDefId === seat.gameDefId &&
      score.score >= 0 &&
      score.score <= MOST_SCORE

    if (!valid) {
      context.log.info({ gameDefId: seat?.gameDefId }, 'score refused')
      return
    }

    const best = await this.repository.score(
      player.gameId,
      seat.gameDefId,
      score.score,
    )
    const kept = player.variables.get(game.leaderboardUserVarRef)?.value ?? 0

    if (best > kept) {
      await this.variables.set(session, game.leaderboardUserVarRef, best)
    }
  }
}
