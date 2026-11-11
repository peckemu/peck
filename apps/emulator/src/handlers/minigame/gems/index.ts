import { inject } from '@needle-di/core'
import { MinigameRepository } from '@peck/database'
import {
  MinigameCatalogue,
  type MinigameTemplate,
  Minigames,
  type Seat,
} from '@peck/game'
import {
  CurrencyOutgoing,
  MinigameGemsIncoming,
  MinigameGemsOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'
import { UserVar } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PlayerVariables } from '#emulator/sessions/variables'

/**
 * The most gems a player wins in a day
 */
const DAILY_LIMIT = 20_000

/**
 * The gems currency
 */
const GEMS = 0

/**
 * Gives minigame gems
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(MinigameGemsIncoming)
export class MinigameGemsHandler extends PacketHandler<MinigameGemsIncoming> {
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
   * Raises the player's counters
   */
  private readonly variables = inject<PlayerVariables>(PlayerVariables)

  /**
   * Gives the award
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: MinigameGemsIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const seat = this.minigames.of(player.gameId)
    if (!seat) return

    const serial = seat.gemSerial
    seat.gemSerial = Minigames.serial()

    const award = Minigames.unfoldAward(packet, serial)
    const game = this.games.get(seat.gameDefId)
    const valid =
      award !== null &&
      game !== null &&
      award.userId === player.id &&
      award.gameDefId === seat.gameDefId &&
      award.amount > 0 &&
      MinigameGemsHandler.allowed(seat, player.id, award.amount, game)

    if (valid) {
      const { granted, gems } = await this.repository.gems(
        player.gameId,
        seat.gameDefId,
        award.amount,
        DAILY_LIMIT,
      )

      if (granted > 0) {
        player.wallet.set('gems', gems)
        await session.send<CurrencyOutgoing>(CurrencyOutgoing.of(GEMS, gems))
        await this.variables.raise(session, UserVar.GemsEarned, granted)
      }
    } else {
      context.log.info({ gameDefId: seat.gameDefId }, 'gem award refused')
    }

    if (this.minigames.of(player.gameId)) {
      await session.send<MinigameGemsOutgoing>(
        MinigameGemsOutgoing.of(seat.gemSerial, false),
      )
    }
  }

  /**
   * Checks an award is one the game gives
   * @param seat The player's seat
   * @param userId The player's session id
   * @param amount The gems
   * @param game The game
   * @returns Whether it is
   */
  private static allowed(
    seat: Seat,
    userId: number,
    amount: number,
    game: MinigameTemplate,
  ): boolean {
    const { match } = seat.table
    if (!match) return amount <= Minigames.mostGems(game.gemMultiplier)

    const index = match.seatOf(userId)
    if (index === null) return false

    return match.award(index, amount, Minigames.pvpGems(game.gemMultiplier))
  }
}
