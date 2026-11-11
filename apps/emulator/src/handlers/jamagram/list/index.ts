import { inject } from '@needle-di/core'
import { JamagramRepository } from '@peck/database'
import { JamagramListIncoming, JamagramListOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { JamagramMail } from '#emulator/handlers/jamagram/mail'

/**
 * Sends the player's Jam-a-Grams
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(JamagramListIncoming)
export class JamagramListHandler extends PacketHandler<JamagramListIncoming> {
  /**
   * Keeps Jam-a-Grams
   */
  private readonly jamagrams = inject<JamagramRepository>(JamagramRepository)

  /**
   * Delivers Jam-a-Grams
   */
  private readonly mail = inject<JamagramMail>(JamagramMail)

  /**
   * Sends the inbox
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: JamagramListIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const inbox = await this.jamagrams.inbox(context.player.gameId)

    await context.session.send<JamagramListOutgoing>(
      JamagramListOutgoing.of(
        packet.room,
        inbox.map((card) => this.mail.show(card)),
      ),
    )
  }
}
