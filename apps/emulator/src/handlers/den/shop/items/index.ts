import { inject } from '@needle-di/core'
import { DenShopRepository } from '@peck/database'
import { DenShopItemsIncoming, DenShopItemsOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PlayerFinder } from '#emulator/sessions/finder'

/**
 * Shows a stand's stock
 * @class
 */
@Handler(DenShopItemsIncoming)
export class DenShopItemsHandler extends PacketHandler<DenShopItemsIncoming> {
  /**
   * Finds players
   */
  private readonly finder = inject<PlayerFinder>(PlayerFinder)

  /**
   * Den shop stands
   */
  private readonly stands = inject<DenShopRepository>(DenShopRepository)

  /**
   * Sends the stand's listings
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DenShopItemsIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const owner = await this.finder.find(packet.ownerUserName)
    const stand = owner
      ? await this.stands.stand(owner.gameId, packet.storeInvId)
      : null

    if (!owner || !stand) {
      return session.send<DenShopItemsOutgoing>(
        DenShopItemsOutgoing.missing(packet.room),
      )
    }

    const own = owner.gameId === player.gameId

    await session.send<DenShopItemsOutgoing>(
      DenShopItemsOutgoing.of(packet.room, stand.state, stand.listings, own),
    )
  }
}
