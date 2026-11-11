import { inject } from '@needle-di/core'
import { MinigameRepository, PetRepository } from '@peck/database'
import { MinigameCatalogue, Minigames } from '@peck/game'
import { MinigameMasteryIncoming, MinigameMasteryOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * The mastery points
 */
const MASTERY = 100

/**
 * Gives a pet mastery points for a minigame
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(MinigameMasteryIncoming)
export class MinigameMasteryHandler extends PacketHandler<MinigameMasteryIncoming> {
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
   * Changes pets
   */
  private readonly pets = inject<PetRepository>(PetRepository)

  /**
   * Gives the award
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: MinigameMasteryIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const seat = this.minigames.of(player.gameId)
    if (!seat) return

    const serial = seat.masterySerial
    seat.masterySerial = Minigames.serial()

    const award = Minigames.unfoldAward(packet, serial)
    const game = this.games.get(seat.gameDefId)
    const pet = player.petOut(seat.ocean)
    const valid =
      award !== null &&
      pet !== null &&
      award.userId === player.id &&
      award.gameDefId === seat.gameDefId &&
      award.amount === 1 &&
      (game?.petDefId ?? 0) > 0 &&
      pet.defId === game?.petDefId

    let mastered = false
    if (valid) {
      const before = pet.masteryCounter
      const after = await this.pets.master(player.gameId, pet.invId, 1)

      if (after !== null) {
        pet.masteryCounter = after
        mastered = before < MASTERY && after >= MASTERY
        await this.repository.mastery(player.gameId, seat.gameDefId, 1)
      }
    }

    await session.send<MinigameMasteryOutgoing>(
      MinigameMasteryOutgoing.of(seat.masterySerial, mastered),
    )
  }
}
