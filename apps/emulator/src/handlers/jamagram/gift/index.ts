import { inject } from '@needle-di/core'
import { JamagramRepository } from '@peck/database'
import { JamagramGiftIncoming, JamagramGiftOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { JamagramMail } from '#emulator/handlers/jamagram/mail'

/**
 * Accepts or returns a Jam-a-Gram's gift
 * @class
 */
@Throttle({ limit: 10, per: 5_000 })
@Handler(JamagramGiftIncoming)
export class JamagramGiftHandler extends PacketHandler<JamagramGiftIncoming> {
  /**
   * Keeps Jam-a-Grams
   */
  private readonly jamagrams = inject<JamagramRepository>(JamagramRepository)

  /**
   * Delivers Jam-a-Grams
   */
  private readonly mail = inject<JamagramMail>(JamagramMail)

  /**
   * Moves a gift
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: JamagramGiftIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const keep = packet.accept === 1

    const moved = await this.jamagrams.answer(
      player.gameId,
      packet.messageId,
      keep,
    )
    if (moved) {
      const { gameId, ...gift } = moved

      if (keep) await this.mail.give(session, player, gift)
      else await this.mail.publish({ type: 'jamagram-gift', to: gameId, gift })
    }

    await context.reply<JamagramGiftOutgoing>(JamagramGiftOutgoing, {
      room: packet.room,
      messageId: packet.messageId,
      result: moved ? 1 : 0,
    })
  }
}
