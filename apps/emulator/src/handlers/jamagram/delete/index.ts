import { inject } from '@needle-di/core'
import { JamagramRepository } from '@peck/database'
import { JamagramDeleteIncoming, JamagramDeleteOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { JamagramMail } from '#emulator/handlers/jamagram/mail'

/**
 * Deletes a Jam-a-Gram
 * @class
 */
@Throttle({ limit: 20, per: 5_000 })
@Handler(JamagramDeleteIncoming)
export class JamagramDeleteHandler extends PacketHandler<JamagramDeleteIncoming> {
  /**
   * Keeps Jam-a-Grams
   */
  private readonly jamagrams = inject<JamagramRepository>(JamagramRepository)

  /**
   * Delivers Jam-a-Grams
   */
  private readonly mail = inject<JamagramMail>(JamagramMail)

  /**
   * Deletes a card
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: JamagramDeleteIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { deleted, returned } = await this.jamagrams.remove(
      context.player.gameId,
      [packet.messageId],
    )

    for (const { gameId, ...gift } of returned) {
      await this.mail.publish({ type: 'jamagram-gift', to: gameId, gift })
    }

    await context.session.send<JamagramDeleteOutgoing>(
      JamagramDeleteOutgoing.of(packet.room, deleted),
    )
  }
}
