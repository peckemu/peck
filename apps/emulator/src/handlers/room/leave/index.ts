import { inject } from '@needle-di/core'
import { Minigames } from '@peck/game'
import { RoomLeaveIncoming } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { MinigameTables } from '#emulator/handlers/minigame/tables'

/**
 * Leaves a game inside the room
 * @class
 */
@Handler(RoomLeaveIncoming)
export class RoomLeaveHandler extends PacketHandler<RoomLeaveIncoming> {
  /**
   * The minigame players
   */
  private readonly minigames = inject<Minigames>(Minigames)

  /**
   * Seats players at games
   */
  private readonly tables = inject<MinigameTables>(MinigameTables)

  /**
   * Takes the player from the game
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: RoomLeaveIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const seat = this.minigames.of(context.player.gameId)
    if (!seat?.inRoom || seat.roomId !== packet.roomId) return

    await this.tables.leave(context.session)
  }
}
