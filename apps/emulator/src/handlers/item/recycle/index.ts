import { inject } from '@needle-di/core'
import { type Recycling, ShopRepository } from '@peck/database'
import { type Player, Prices } from '@peck/game'
import {
  ItemListOutgoing,
  ItemRecycleIncoming,
  ItemRecycleOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Recycles clothing for gems
 * @class
 */
@Handler(ItemRecycleIncoming)
export class ItemRecycleHandler extends PacketHandler<ItemRecycleIncoming> {
  /**
   * Works out prices
   */
  private readonly prices = inject<Prices>(Prices)

  /**
   * Recycles things
   */
  private readonly shops = inject<ShopRepository>(ShopRepository)

  /**
   * Recycles items
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: ItemRecycleIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const entries = this.recyclable(player, packet.invIds)
    if (entries.length === 0) {
      return session.send<ItemRecycleOutgoing>(
        ItemRecycleOutgoing.of(packet.room, [], -1),
      )
    }

    const { recycled, gems } = await this.shops.recycle(
      player.gameId,
      'clothing',
      entries,
    )

    for (const invId of recycled) player.items.remove(invId)
    player.wallet.set('gems', gems)

    await session.send<ItemRecycleOutgoing>(
      ItemRecycleOutgoing.of(packet.room, recycled, gems),
    )

    if (recycled.length === 0 || !player.avatar) return

    await session.send<ItemListOutgoing>(
      ItemListOutgoing.changed(player, player.avatar, {
        wear: false,
        color: 0,
        added: [],
        removed: recycled,
      }),
    )
  }

  /**
   * Picks what can be recycled
   * @param player The player
   * @param invIds The wanted items
   * @returns What can be recycled
   */
  private recyclable(player: Player, invIds: readonly number[]): Recycling[] {
    return [...new Set(invIds)].flatMap((invIdx) => {
      const item = player.items.get(invIdx)
      if (item?.denStoreInvIdx !== 0) return []

      return [
        {
          invIdx,
          defId: item.defId,
          gems: this.prices.clothingRecycle(item.defId),
        },
      ]
    })
  }
}
