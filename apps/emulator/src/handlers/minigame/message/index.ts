import { inject } from '@needle-di/core'
import { UploadTokens } from '@peck/cluster'
import { type Match, Minigames, type Seat } from '@peck/game'
import { MinigameMessageIncoming, MinigameMessageOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { MinigameTables } from '#emulator/handlers/minigame/tables'

/**
 * An upload token request
 */
const UPLOAD_TOKEN = 'gmtkn'

/**
 * A game ready to start
 */
const READY = 'ready'

/**
 * Answers a minigame's own messages
 * @class
 */
@Throttle({ limit: 60, per: 10_000 })
@Handler(MinigameMessageIncoming)
export class MinigameMessageHandler extends PacketHandler<MinigameMessageIncoming> {
  /**
   * Upload tokens
   */
  private readonly tokens = inject<UploadTokens>(UploadTokens)

  /**
   * The minigame players
   */
  private readonly minigames = inject<Minigames>(Minigames)

  /**
   * Seats players at games
   */
  private readonly tables = inject<MinigameTables>(MinigameTables)

  /**
   * Answers the game
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: MinigameMessageIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const [command] = packet.data

    if (command === UPLOAD_TOKEN) {
      const token = await this.tokens.issue(player.gameId)
      return session.send<MinigameMessageOutgoing>(
        MinigameMessageOutgoing.token(packet.room, token),
      )
    }

    const seat = this.minigames.of(player.gameId)
    const match = seat?.table.match ?? null
    const index = match?.seatOf(player.id) ?? null
    if (!seat || !match || index === null) return
    if (this.refusal(packet, seat, match) !== null) return

    if (command !== READY) {
      return this.tables.referee(
        seat.table,
        match.referee.message(index, packet.data),
      )
    }

    if (match.ready(index) && seat.table.players.length === 2) {
      await this.tables.referee(seat.table, match.referee.ready())
    }
  }

  /**
   * Finds why the message is not for the match
   * @param packet The packet
   * @param seat The player's seat
   * @param match The match
   * @returns The reason, or null
   */
  private refusal(
    packet: MinigameMessageIncoming,
    seat: Seat,
    match: Match,
  ): string | null {
    if (seat.gameDefId !== packet.gameDefId) return 'another game'
    if (match.abandoned) return 'over'

    return null
  }
}
