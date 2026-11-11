import { inject } from '@needle-di/core'
import { MinigameCatalogue, type MinigameTemplate } from '@peck/game'
import { MinigameCustomPvpIncoming, MinigamePvpOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { MinigameTables } from '#emulator/handlers/minigame/tables'
import { SessionManager } from '#emulator/sessions/manager'
import { type Session } from '#emulator/sessions/session'

/**
 * Joins a two player game a player hosts
 * @class
 */
@Throttle({ limit: 10, per: 10_000 })
@Handler(MinigameCustomPvpIncoming)
export class MinigameCustomPvpHandler extends PacketHandler<MinigameCustomPvpIncoming> {
  /**
   * Every minigame
   */
  private readonly games = inject<MinigameCatalogue>(MinigameCatalogue)

  /**
   * Seats players at games
   */
  private readonly tables = inject<MinigameTables>(MinigameTables)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Starts the game with its host
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: MinigameCustomPvpIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { session } = context

    const host = this.sessions.byUsername(packet.userName)
    const game = this.games.get(packet.gameDefId)
    const refusal = this.refusal(packet, context, host, game)

    if (refusal !== null || !host || !game) {
      context.log.info({ refusal }, 'hosted game join refused')
      return session.send<MinigamePvpOutgoing>(
        MinigamePvpOutgoing.refused(packet.gameDefId),
      )
    }

    await this.tables.dropInvite(session)
    await this.tables.dropInvite(host)
    await this.tables.match(game, host, session)
  }

  /**
   * Finds why the game can't be joined
   * @param packet The packet
   * @param context The packet context
   * @param host The host, or null
   * @param game The game, or null
   * @returns The reason, or null
   */
  private refusal(
    packet: MinigameCustomPvpIncoming,
    context: HandlerContext,
    host: Session | null,
    game: MinigameTemplate | null,
  ): string | null {
    const hosted = host?.player?.hostedGame ?? null
    if (host && hosted !== packet.gameDefId) return 'not hosting it'

    return this.tables.refusal(context.session, host, game)
  }
}
