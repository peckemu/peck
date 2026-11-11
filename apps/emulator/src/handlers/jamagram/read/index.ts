import { inject } from '@needle-di/core'
import { JamagramRepository } from '@peck/database'
import { JamagramReadIncoming, JamagramReadOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Opens a Jam-a-Gram
 * @class
 */
@Throttle({ limit: 20, per: 5_000 })
@Handler(JamagramReadIncoming)
export class JamagramReadHandler extends PacketHandler<JamagramReadIncoming> {
  /**
   * Keeps Jam-a-Grams
   */
  private readonly jamagrams = inject<JamagramRepository>(JamagramRepository)

  /**
   * Marks the card read
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: JamagramReadIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const read = await this.jamagrams.read(
      context.player.gameId,
      packet.messageId,
    )

    await context.reply<JamagramReadOutgoing>(JamagramReadOutgoing, {
      room: packet.room,
      messageId: packet.messageId,
      result: read ? 1 : 0,
    })
  }
}
