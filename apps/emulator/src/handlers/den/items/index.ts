import { inject } from '@needle-di/core'
import { DenItemCatalogue } from '@peck/game'
import { DenItemsIncoming, DenItemsOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Lists the player's den items
 * @class
 */
@Handler(DenItemsIncoming)
export class DenItemsHandler extends PacketHandler<DenItemsIncoming> {
  /**
   * Every den item
   */
  private readonly catalogue = inject<DenItemCatalogue>(DenItemCatalogue)

  /**
   * Sends the den items
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DenItemsIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    await session.send<DenItemsOutgoing>(
      DenItemsOutgoing.of(
        packet.room,
        player.activeDenInvIdx,
        player.denItems,
        (defId) => this.catalogue.isMannequin(defId),
        player.placedPets.map(({ invId }) => invId),
      ),
    )
  }
}
