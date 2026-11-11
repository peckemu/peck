import { inject } from '@needle-di/core'
import { type Lobby, MinigameCatalogue, Minigames } from '@peck/game'
import { MinigameStartIncoming } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { MinigameTables } from '#emulator/handlers/minigame/tables'

/**
 * Starts a waiting minigame now
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(MinigameStartIncoming)
export class MinigameStartHandler extends PacketHandler<MinigameStartIncoming> {
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
   * Starts the waiting list's game
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: MinigameStartIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const lobby = this.minigames.lobbyOf(context.player.gameId)

    const refusal = this.refusal(packet, lobby)
    if (refusal !== null || !lobby) {
      context.log.info({ refusal }, 'minigame start refused')
      return
    }

    await this.tables.startLobby(lobby)
  }

  /**
   * Finds why the game can't start
   * @param packet The packet
   * @param lobby The player's waiting list, or null
   * @returns The reason, or null
   */
  private refusal(
    packet: MinigameStartIncoming,
    lobby: Lobby | null,
  ): string | null {
    if (lobby?.gameDefId !== packet.gameDefId) return 'not waiting'

    const fewest = this.games.get(lobby.gameDefId)?.minPlayers ?? 1
    if (lobby.waiting.length < fewest) return 'too few'

    return null
  }
}
