import { inject } from '@needle-di/core'
import { MasterpieceRepository } from '@peck/database'
import { MasterpiecesIncoming, MasterpiecesOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * The board size
 */
const BOARD_SIZE = 10

/**
 * Sends the party board's masterpieces
 * @class
 */
@Throttle({ limit: 3, per: 5_000 })
@Handler(MasterpiecesIncoming)
export class MasterpiecesHandler extends PacketHandler<MasterpiecesIncoming> {
  /**
   * Keeps masterpieces
   */
  private readonly masterpieces = inject<MasterpieceRepository>(
    MasterpieceRepository,
  )

  /**
   * Sends the newest masterpieces
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: MasterpiecesIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const pool = await this.masterpieces.newest(BOARD_SIZE)

    await context.session.send<MasterpiecesOutgoing>(
      MasterpiecesOutgoing.of(packet.room, pool),
    )
  }
}
