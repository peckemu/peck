import { inject } from '@needle-di/core'
import { MasterpieceRepository } from '@peck/database'
import {
  MasterpieceCreatorIncoming,
  MasterpieceCreatorOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Names who painted a masterpiece
 * @class
 */
@Throttle({ limit: 10, per: 5_000 })
@Handler(MasterpieceCreatorIncoming)
export class MasterpieceCreatorHandler extends PacketHandler<MasterpieceCreatorIncoming> {
  /**
   * Keeps masterpieces
   */
  private readonly masterpieces = inject<MasterpieceRepository>(
    MasterpieceRepository,
  )

  /**
   * Sends the painter's name
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: MasterpieceCreatorIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const creatorName = await this.masterpieces.creator(
      packet.uniqueImageId,
      context.player.gameId,
    )

    await context.reply<MasterpieceCreatorOutgoing>(
      MasterpieceCreatorOutgoing,
      {
        room: packet.room,
        creatorName,
      },
    )
  }
}
