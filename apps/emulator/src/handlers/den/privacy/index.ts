import { inject } from '@needle-di/core'
import { DenRepository } from '@peck/database'
import { DenRules, type Player, RoomManager } from '@peck/game'
import {
  DenKickedOutgoing,
  DenPrivacyIncoming,
  DenPrivacyOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { DenView } from '#emulator/handlers/den/view'
import { PlayerFinder } from '#emulator/sessions/finder'
import { SessionManager } from '#emulator/sessions/manager'

/**
 * Sets den privacy or tells someone's
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(DenPrivacyIncoming)
export class DenPrivacyHandler extends PacketHandler<DenPrivacyIncoming> {
  /**
   * Saves dens
   */
  private readonly dens = inject<DenRepository>(DenRepository)

  /**
   * Finds players
   */
  private readonly finder = inject<PlayerFinder>(PlayerFinder)

  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Shows players dens
   */
  private readonly view = inject<DenView>(DenView)

  /**
   * Sets or tells den privacy
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DenPrivacyIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    if (packet.lookup) {
      const owner = await this.finder.find(packet.value)
      return session.send<DenPrivacyOutgoing>(
        DenPrivacyOutgoing.of(
          packet.room,
          packet.value,
          owner?.denPrivacy ?? 0,
        ),
      )
    }

    const privacy = Number(packet.value)
    if (!DenRules.privacy(privacy)) {
      context.log.info({ privacy: packet.value }, 'den privacy refused')
      return
    }

    player.denPrivacy = privacy
    await this.dens.privacy(player.gameId, privacy)
    await this.sendOut(player)
  }

  /**
   * Sends out the visitors no longer let in
   * @param owner The den's owner
   */
  private async sendOut(owner: Player): Promise<void> {
    const den = this.rooms.instancesOf(`den${owner.username}`)[0]
    if (!den) return

    for (const visitor of this.sessions.inRoom(den.id)) {
      if (!visitor.player || DenRules.welcomes(owner, visitor.player)) continue

      await visitor.send<DenKickedOutgoing>(DenKickedOutgoing.of())
      await this.view.sendHome(visitor)
    }
  }
}
