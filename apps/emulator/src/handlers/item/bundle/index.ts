import { inject } from '@needle-di/core'
import {
  type BoughtBundle,
  type BundlePart,
  ShopRepository,
} from '@peck/database'
import {
  DenItemCatalogue,
  DenRoomCatalogue,
  DiamondCatalogue,
  DiamondType,
  GenericListCatalogue,
  type GenericListTemplate,
  Item,
  ItemCatalogue,
  type Player,
  ShopStock,
} from '@peck/game'
import {
  DenItemsOutgoing,
  DenRoomsOutgoing,
  DiamondBundleIncoming,
  DiamondBundleOutgoing,
  ItemListOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'
import { InventoryLimit } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'
import { type Session } from '#emulator/sessions/session'

/**
 * Buys a shop's whole bundle
 * @class
 */
@Throttle({ limit: 3, per: 5_000 })
@Handler(DiamondBundleIncoming)
export class DiamondBundleHandler extends PacketHandler<DiamondBundleIncoming> {
  /**
   * Every generic list
   */
  private readonly lists = inject<GenericListCatalogue>(GenericListCatalogue)

  /**
   * The shop stock
   */
  private readonly stock = inject<ShopStock>(ShopStock)

  /**
   * Every diamond shop entry
   */
  private readonly diamonds = inject<DiamondCatalogue>(DiamondCatalogue)

  /**
   * Every clothing item
   */
  private readonly items = inject<ItemCatalogue>(ItemCatalogue)

  /**
   * Every den item
   */
  private readonly denItems = inject<DenItemCatalogue>(DenItemCatalogue)

  /**
   * Every den room
   */
  private readonly denRooms = inject<DenRoomCatalogue>(DenRoomCatalogue)

  /**
   * Pays for things
   */
  private readonly shops = inject<ShopRepository>(ShopRepository)

  /**
   * Buys the bundle
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DiamondBundleIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const list = this.lists.get(packet.shopId)
    const parts = list ? this.parts(list, player) : []

    const refusal = this.refusal(player, list, parts)
    if (refusal !== null || !list) {
      context.log.info({ shopId: packet.shopId, refusal }, 'bundle refused')
      return session.send<DiamondBundleOutgoing>(
        DiamondBundleOutgoing.refused(packet.room),
      )
    }

    const bought = await this.shops.buyBundle(player.gameId, {
      shopId: list.defId,
      diamonds: list.diamondCost,
      parts,
    })
    if (!bought) {
      context.log.info({ shopId: list.defId }, 'bundle not paid for')
      return session.send<DiamondBundleOutgoing>(
        DiamondBundleOutgoing.refused(packet.room),
      )
    }

    player.wallet.set('diamonds', bought.diamonds)

    await session.send<DiamondBundleOutgoing>(
      DiamondBundleOutgoing.bought(packet.room, bought.diamonds),
    )
    await this.deliver(session, player, bought)
  }

  /**
   * Reads what a bundle holds
   * @param list The bundle's list
   * @param player The player
   * @returns The parts
   */
  private parts(list: GenericListTemplate, player: Player): BundlePart[] {
    const ids = this.stock.shelf(list.defId)?.get(list.type) ?? list.ids
    const taken = new Set(player.denRooms.map(({ invIdx }) => invIdx))
    let slot = 1

    return ids.flatMap((id): BundlePart[] => {
      const entry = this.diamonds.get(id)
      if (!entry) return []

      if (entry.type === DiamondType.Clothing) {
        const item = this.items.get(entry.refId)

        return item
          ? [
              {
                kind: 'clothing',
                defId: item.defId,
                color: item.colors[0] ?? 0,
              },
            ]
          : []
      }

      if (entry.type === DiamondType.DenItem) {
        return this.denItems.has(entry.refId)
          ? [{ kind: 'den-item', defId: entry.refId }]
          : []
      }

      if (entry.type !== DiamondType.DenRoom) return []
      if (!this.denRooms.has(entry.refId)) return []

      while (taken.has(slot)) slot++
      if (slot > InventoryLimit.DenRoomSlot) return []

      taken.add(slot)

      return [{ kind: 'den-room', defId: entry.refId, slot }]
    })
  }

  /**
   * Hands the player what the bundle gave
   * @param session The player's session
   * @param player The player
   * @param bought The bundle
   */
  private async deliver(
    session: Session,
    player: Player,
    bought: BoughtBundle,
  ): Promise<void> {
    const clothing = bought.parts.filter(({ kind }) => kind === 'clothing')
    const denItems = bought.parts.filter(({ kind }) => kind === 'den-item')
    const denRooms = bought.parts.filter(({ kind }) => kind === 'den-room')

    for (const { invIdx, defId, color } of clothing) {
      player.items.add(new Item({ invId: invIdx, defId, color: color ?? 0 }))
    }
    for (const { invIdx, defId } of denItems) {
      player.denItems.push({
        invIdx,
        defId,
        categoryId: 0,
        version: 0,
        x: 0,
        y: 0,
        flipped: false,
        userNameLink: '',
        denStoreInvIdx: 0,
      })
    }
    for (const { invIdx, defId } of denRooms) {
      player.denRooms.push({ invIdx, defId })
    }

    const [first] = clothing
    if (first && player.avatar) {
      await session.send<ItemListOutgoing>(
        ItemListOutgoing.changed(player, player.avatar, {
          wear: false,
          color: first.color ?? 0,
          added: clothing.map(({ invIdx, defId }) => ({
            invId: invIdx,
            defId,
          })),
          removed: [],
        }),
      )
    }

    if (denItems.length > 0) {
      await session.send<DenItemsOutgoing>(
        DenItemsOutgoing.of(
          -1,
          player.activeDenInvIdx,
          player.denItems,
          (id) => this.denItems.isMannequin(id),
          player.placedPets.map(({ invId }) => invId),
        ),
      )
    }

    if (denRooms.length > 0) {
      await session.send<DenRoomsOutgoing>(
        DenRoomsOutgoing.of(-1, player.denRooms),
      )
    }
  }

  /**
   * Finds why a bundle can't be bought
   * @param player The player
   * @param list The bundle's list
   * @param parts What it holds
   * @returns The reason, or null
   */
  private refusal(
    player: Player,
    list: GenericListTemplate | null,
    parts: readonly BundlePart[],
  ): string | null {
    if (!list?.diamondBundle || list.diamondCost <= 0) return 'not a bundle'
    if (!player.member) return 'not a member'
    if (parts.length === 0) return 'nothing to give'

    const clothing = parts.filter(({ kind }) => kind === 'clothing').length
    if (player.items.size + clothing > player.clothingLimit) {
      return 'too much clothing'
    }

    const denItems = parts.filter(({ kind }) => kind === 'den-item').length
    if (player.denItems.length + denItems > player.denItemLimit) {
      return 'too many den items'
    }

    return null
  }
}
