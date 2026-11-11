import { inject } from '@needle-di/core'
import {
  MinigameCatalogue,
  type MinigameTemplate,
  Minigames,
  PetRules,
  type Player,
} from '@peck/game'
import {
  MinigameJoinIncoming,
  MinigameJoinOutgoing,
  MinigameRefusal,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { MinigameTables } from '#emulator/handlers/minigame/tables'

/**
 * A game for land animals
 */
const LAND = 1

/**
 * A game for ocean animals
 */
const OCEAN = 2

/**
 * Starts a minigame
 * @class
 */
@Handler(MinigameJoinIncoming)
export class MinigameJoinHandler extends PacketHandler<MinigameJoinIncoming> {
  /**
   * Every minigame
   */
  private readonly games = inject<MinigameCatalogue>(MinigameCatalogue)

  /**
   * The minigame players
   */
  private readonly minigames = inject<Minigames>(Minigames)

  /**
   * Seats players at games
   */
  private readonly tables = inject<MinigameTables>(MinigameTables)

  /**
   * Seats the player
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: MinigameJoinIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const multiplayer = packet.multiplayer !== 0

    const lobby = this.minigames.lobbyOf(player.gameId)
    if (lobby?.gameDefId === packet.gameDefId && !multiplayer) {
      return this.tables.leaveLobby(session)
    }

    await this.tables.leaveLobby(session)
    await this.tables.dropInvite(session)
    await this.tables.leave(session)

    const game = this.games.get(packet.gameDefId)
    const ocean = PetRules.inOcean(player)
    const refusal = MinigameJoinHandler.refusal(player, game, ocean)

    if (refusal || !game) {
      const [code, value] = refusal ?? [MinigameRefusal.Animal, 0]
      context.log.info(
        { gameDefId: packet.gameDefId, code },
        'minigame refused',
      )
      return session.send<MinigameJoinOutgoing>(
        MinigameJoinOutgoing.refused(packet.room, code, value),
      )
    }

    if (multiplayer && MinigameTables.waits(game) && player.room) {
      return this.tables.wait(
        session,
        game,
        packet.hostUserId,
        packet.proModeId,
      )
    }

    await this.tables.play(game, [session], packet.proModeId)
  }

  /**
   * Checks a player can play a game
   * @param player The player
   * @param game The game
   * @param ocean Whether in the ocean
   * @returns The refusal, or null
   */
  private static refusal(
    player: Player,
    game: MinigameTemplate | null,
    ocean: boolean,
  ): readonly [MinigameRefusal, number] | null {
    if (!game || game.readyForPvp || !player.avatar) {
      return [MinigameRefusal.Animal, 0]
    }

    if (game.petDefId > 0 && player.petOut(ocean)?.defId !== game.petDefId) {
      return [MinigameRefusal.Pet, game.petDefId]
    }

    if (game.requiredAvatarType === OCEAN && !ocean) {
      return [MinigameRefusal.Animal, -1]
    }
    if (game.requiredAvatarType === LAND && ocean) {
      return [MinigameRefusal.Animal, 0]
    }

    return null
  }
}
