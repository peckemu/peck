import { inject } from '@needle-di/core'
import { MinigameCatalogue, Minigames } from '@peck/game'
import { MinigamePvpIncoming, MinigamePvpOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'
import { PvpAction } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'
import { MinigameTables } from '#emulator/handlers/minigame/tables'
import { SessionManager } from '#emulator/sessions/manager'
import { type Session } from '#emulator/sessions/session'

/**
 * Asks, accepts or turns down a two player game
 * @class
 */
@Throttle({ limit: 10, per: 10_000 })
@Handler(MinigamePvpIncoming)
export class MinigamePvpHandler extends PacketHandler<MinigamePvpIncoming> {
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
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Handles the answer
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: MinigamePvpIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { session } = context
    const userName = packet.userName ?? ''

    if (packet.action !== PvpAction.Ask) {
      return this.tables.dropInvite(session)
    }
    if (userName === '') return this.accept(packet, context)

    await this.tables.dropInvite(session)

    const asked = this.sessions.byUsername(userName)
    const game = this.games.get(packet.gameDefId)
    const refusal = this.tables.refusal(session, asked, game)

    if (refusal !== null || !asked || !game) {
      context.log.info({ refusal }, 'game invite refused')
      return session.send<MinigamePvpOutgoing>(
        MinigamePvpOutgoing.refused(packet.gameDefId),
      )
    }

    this.minigames.invite(
      game.defId,
      context.player.gameId,
      asked.player?.gameId ?? -1,
    )

    await asked.send<MinigamePvpOutgoing>(
      MinigamePvpOutgoing.invite(game.defId, context.player.username, true),
    )
  }

  /**
   * Accepts an invite
   * @param packet The packet
   * @param context The packet context
   */
  private async accept(
    packet: MinigamePvpIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const invite = this.minigames.inviteOf(player.gameId)
    const asker = invite ? this.sessions.byPlayer(invite.from) : null
    const game = this.games.get(packet.gameDefId)
    const refusal = this.refusal(packet, context, asker)

    await this.tables.dropInvite(session, false)

    if (refusal !== null || !asker || !game) {
      context.log.info({ refusal }, 'game invite answer refused')
      return session.send<MinigamePvpOutgoing>(
        MinigamePvpOutgoing.refused(packet.gameDefId),
      )
    }

    await this.tables.match(game, asker, session)
  }

  /**
   * Finds why an invite can't be accepted
   * @param packet The packet
   * @param context The packet context
   * @param asker The player who asked, or null
   * @returns The reason, or null
   */
  private refusal(
    packet: MinigamePvpIncoming,
    context: HandlerContext,
    asker: Session | null,
  ): string | null {
    const invite = this.minigames.inviteOf(context.player.gameId)

    if (invite?.to !== context.player.gameId) return 'not asked'
    if (invite.gameDefId !== packet.gameDefId) return 'another game'
    if (!asker || asker.closed) return 'gone'
    if (!this.tables.free(asker) || !this.tables.free(context.session)) {
      return 'busy'
    }

    return null
  }
}
