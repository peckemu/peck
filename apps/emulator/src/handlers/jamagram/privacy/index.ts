import { inject } from '@needle-di/core'
import { JamagramRepository } from '@peck/database'
import { JamagramPrivacyIncoming, JamagramPrivacyOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * The privacy settings
 */
const SETTINGS: ReadonlySet<number> = new Set([0, 1, 2])

/**
 * Changes the player's Jam-a-Gram privacy
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(JamagramPrivacyIncoming)
export class JamagramPrivacyHandler extends PacketHandler<JamagramPrivacyIncoming> {
  /**
   * Keeps Jam-a-Grams
   */
  private readonly jamagrams = inject<JamagramRepository>(JamagramRepository)

  /**
   * Saves the setting
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: JamagramPrivacyIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player } = context
    const valid = SETTINGS.has(packet.setting)

    if (valid) {
      await this.jamagrams.privacy(player.gameId, packet.setting)
      player.ecardPrivacy = packet.setting
    }

    await context.reply<JamagramPrivacyOutgoing>(JamagramPrivacyOutgoing, {
      room: packet.room,
      result: valid ? 1 : 0,
    })
  }
}
