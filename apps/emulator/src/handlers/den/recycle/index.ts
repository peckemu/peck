import { inject } from '@needle-di/core'
import { DenRepository, type Recycling, ShopRepository } from '@peck/database'
import {
  Den,
  DenItemCatalogue,
  type OwnedDenItem,
  type Player,
  Prices,
  RoomManager,
} from '@peck/game'
import {
  DenItemsOutgoing,
  DenRecycleIncoming,
  DenRecycleOutgoing,
  DenStateOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { SessionManager } from '#emulator/sessions/manager'

/**
 * Den rooms are recycled
 */
const ROOMS = -1

/**
 * Recycles den items or den rooms for gems
 * @class
 */
@Handler(DenRecycleIncoming)
export class DenRecycleHandler extends PacketHandler<DenRecycleIncoming> {
  /**
   * Works out prices
   */
  private readonly prices = inject<Prices>(Prices)

  /**
   * Every den item
   */
  private readonly denItems = inject<DenItemCatalogue>(DenItemCatalogue)

  /**
   * Recycles things
   */
  private readonly shops = inject<ShopRepository>(ShopRepository)

  /**
   * Saves dens
   */
  private readonly dens = inject<DenRepository>(DenRepository)

  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Recycles items
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DenRecycleIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const rooms = packet.kind === ROOMS
    const invIdxs = DenRecycleHandler.invIdxs(packet.invIdxs)

    const entries = rooms
      ? this.roomsOf(player, invIdxs)
      : this.itemsOf(player, invIdxs)
    if (entries.length === 0) {
      return session.send<DenRecycleOutgoing>(
        DenRecycleOutgoing.of(packet.room, [], -1),
      )
    }

    const kind = rooms ? 'den-room' : 'den-item'
    const { recycled, gems } = await this.shops.recycle(
      player.gameId,
      kind,
      entries,
    )

    player.wallet.set('gems', gems)
    await session.send<DenRecycleOutgoing>(
      DenRecycleOutgoing.of(packet.room, recycled, gems),
    )

    if (rooms) {
      DenRecycleHandler.removeRooms(player, recycled)
      await this.dens.forget(player.gameId, recycled)
      return
    }

    const placed = DenRecycleHandler.removeItems(player, recycled)

    await session.send<DenItemsOutgoing>(
      DenItemsOutgoing.of(
        -1,
        player.activeDenInvIdx,
        player.denItems,
        (id) => this.denItems.isMannequin(id),
        player.placedPets.map(({ invId }) => invId),
      ),
    )
    await this.clearDen(player, placed)
  }

  /**
   * Picks recyclable den rooms
   * @param player The player
   * @param invIdxs The wanted rooms
   * @returns What can be recycled
   */
  private roomsOf(player: Player, invIdxs: readonly number[]): Recycling[] {
    return invIdxs.flatMap((invIdx) => {
      const room = player.denRooms.find((each) => each.invIdx === invIdx)
      if (!room || invIdx <= 0 || invIdx === player.activeDenInvIdx) return []

      return [
        {
          invIdx,
          defId: room.defId,
          gems: this.prices.denRoomRecycle(room.defId),
        },
      ]
    })
  }

  /**
   * Picks recyclable den items
   * @param player The player
   * @param invIdxs The wanted items
   * @returns What can be recycled
   */
  private itemsOf(player: Player, invIdxs: readonly number[]): Recycling[] {
    return invIdxs.flatMap((invIdx) => {
      const item = player.denItems.find((each) => each.invIdx === invIdx)
      if (item?.denStoreInvIdx !== 0 || Den.unapproved(item)) return []

      return [
        {
          invIdx,
          defId: item.defId,
          gems: this.prices.denItemRecycle(item.defId),
        },
      ]
    })
  }

  /**
   * Removes recycled items from the den
   * @param player The owner
   * @param placed The placed recycled items
   */
  private async clearDen(
    player: Player,
    placed: readonly OwnedDenItem[],
  ): Promise<void> {
    if (placed.length === 0) return

    const den = this.rooms.instancesOf(`den${player.username}`)[0]
    if (!den) return

    const items = placed.map((item) => ({
      ...item,
      categoryId: 0,
      mannequin: this.denItems.isMannequin(item.defId),
    }))
    await this.sessions.broadcast<DenStateOutgoing>(
      den.id,
      DenStateOutgoing.of(den.id, items),
    )
  }

  /**
   * Reads den item places
   * @param text The places
   * @returns The unique places
   */
  private static invIdxs(text: string): number[] {
    const invIdxs = text
      .split(',')
      .filter((part) => part !== '')
      .map(Number)
      .filter(Number.isSafeInteger)

    return [...new Set(invIdxs)]
  }

  /**
   * Takes recycled den rooms from the player
   * @param player The player
   * @param recycled The rooms recycled
   */
  private static removeRooms(
    player: Player,
    recycled: readonly number[],
  ): void {
    const kept = player.denRooms.filter(
      ({ invIdx }) => !recycled.includes(invIdx),
    )
    player.denRooms.splice(0, player.denRooms.length, ...kept)
  }

  /**
   * Takes recycled den items from the player
   * @param player The player
   * @param recycled The items recycled
   * @returns The placed recycled items
   */
  private static removeItems(
    player: Player,
    recycled: readonly number[],
  ): OwnedDenItem[] {
    const placed = player.denItems.filter(
      ({ invIdx, categoryId }) => recycled.includes(invIdx) && categoryId !== 0,
    )

    const kept = player.denItems
      .filter(({ invIdx }) => !recycled.includes(invIdx))
      .map((item) =>
        recycled.includes(item.denStoreInvIdx)
          ? { ...item, denStoreInvIdx: 0 }
          : item,
      )
    player.denItems.splice(0, player.denItems.length, ...kept)

    for (const item of player.items) {
      if (recycled.includes(item.denStoreInvIdx)) item.denStoreInvIdx = 0
    }

    return placed
  }
}
