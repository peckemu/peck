import { inject } from '@needle-di/core'
import { MinigameLeaveIncoming } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { MinigameTables } from '#emulator/handlers/minigame/tables'

/**
 * Leaves a minigame
 * @class
 */
@Handler(MinigameLeaveIncoming)
export class MinigameLeaveHandler extends PacketHandler<MinigameLeaveIncoming> {
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
    packet: MinigameLeaveIncoming,
    context: HandlerContext,
  ): Promise<void> {
    await this.tables.leave(context.session)
  }
}
