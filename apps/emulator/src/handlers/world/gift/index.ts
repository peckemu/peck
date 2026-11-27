import { inject } from '@needle-di/core'
import { type ClaimGift, ClaimRepository } from '@peck/database'
import {
  DenItemCatalogue,
  GenericListCatalogue,
  Item,
  ItemCatalogue,
  type Player,
  ShopStock,
  WorldItemCatalogue,
  WorldItemGift,
  type WorldItemTemplate,
} from '@peck/game'
import {
  DenItemsOutgoing,
  ItemListOutgoing,
  WorldItemGiftIncoming,
  WorldItemGiftOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '../../../dispatch/context/index.ts'
import { type Session } from '../../../sessions/session/index.ts'
import { PlayerVariables } from '../../../sessions/variables/index.ts'

/**
 * The world items list
 */
const WORLD_ITEMS = 583

/**
 * The highest bit a user variable holds
 */
const MOST_BITS = 31

/**
 * Gives a world item's gift
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(WorldItemGiftIncoming)
export class WorldItemGiftHandler extends PacketHandler<WorldItemGiftIncoming> {
  /**
   * Every generic list
   */
  private readonly lists = inject<GenericListCatalogue>(GenericListCatalogue)

  /**
   * The shop stock
   */
  private readonly stock = inject<ShopStock>(ShopStock)

  /**
   * Every world item
   */
  private readonly worldItems = inject<WorldItemCatalogue>(WorldItemCatalogue)

  /**
   * Every clothing item
   */
  private readonly items = inject<ItemCatalogue>(ItemCatalogue)

  /**
   * Every den item
   */
  private readonly denItems = inject<DenItemCatalogue>(DenItemCatalogue)

  /**
   * Keeps the world items players picked up
   */
  private readonly claims = inject<ClaimRepository>(ClaimRepository)

  /**
   * Keeps the player's variables
   */
  private readonly variables = inject<PlayerVariables>(PlayerVariables)

  /**
   * Gives the gift
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: WorldItemGiftIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const worldItem = this.worldItems.out(packet.defId, new Date())
    const gift = worldItem ? this.gift(worldItem, packet) : null

    const refusal = this.refusal(player, worldItem, gift)
    if (refusal !== null || !worldItem || !gift) {
      context.log.info({ defId: packet.defId, refusal }, 'gift refused')
      return session.send<WorldItemGiftOutgoing>(
        WorldItemGiftOutgoing.refused(packet.room),
      )
    }

    const claimed = await this.claims.claim(player.gameId, {
      worldItemDefId: worldItem.defId,
      varId: worldItem.userVarRefId,
      bit: worldItem.uvIndex,
      gift,
    })
    if (!claimed) {
      context.log.info({ defId: worldItem.defId }, 'gift already taken')
      return session.send<WorldItemGiftOutgoing>(
        WorldItemGiftOutgoing.refused(packet.room),
      )
    }

    await session.send<WorldItemGiftOutgoing>(
      WorldItemGiftOutgoing.given(packet.room, claimed.balance),
    )
    await this.deliver(session, player, gift, claimed.balance, claimed.invIdx)
    await this.variables.change(session, {
      varId: worldItem.userVarRefId,
      type: claimed.type,
      value: claimed.value,
    })
  }

  /**
   * Reads what a world item gives
   * @param worldItem The world item
   * @param packet The packet
   * @returns The gift, or null
   */
  private gift(
    worldItem: WorldItemTemplate,
    packet: WorldItemGiftIncoming,
  ): ClaimGift | null {
    switch (worldItem.giftType) {
      case WorldItemGift.Gems:
        return { kind: 'gems', amount: worldItem.amount }
      case WorldItemGift.Diamonds:
        return { kind: 'diamonds', amount: worldItem.amount }
      case WorldItemGift.DenItem:
        return this.denItems.has(worldItem.giftRefId)
          ? {
              kind: 'den-item',
              defId: worldItem.giftRefId,
              color: 0,
              version: Math.max(0, packet.version),
            }
          : null
      case WorldItemGift.Clothing: {
        const color = this.items.get(worldItem.giftRefId)?.colors[
          packet.colorIndex
        ]

        return color === undefined
          ? null
          : { kind: 'clothing', defId: worldItem.giftRefId, color, version: 0 }
      }
      default:
        return null
    }
  }

  /**
   * Finds why a gift can't be given
   * @param player The player
   * @param worldItem The world item, or null
   * @param gift The gift, or null
   * @returns The reason, or null
   */
  private refusal(
    player: Player,
    worldItem: WorldItemTemplate | null,
    gift: ClaimGift | null,
  ): string | null {
    if (!worldItem) return 'not out'
    if (!this.listed(worldItem.defId)) return 'not listed'
    if (worldItem.uvIndex < 0 || worldItem.uvIndex > MOST_BITS) {
      return 'bad bit'
    }
    if (!gift) return 'no gift'
    if ('amount' in gift && gift.amount <= 0) {
      return 'nothing given'
    }
    if (gift.kind === 'clothing' && player.items.size >= player.clothingLimit) {
      return 'clothing full'
    }
    if (
      gift.kind === 'den-item' &&
      player.denItems.length >= player.denItemLimit
    ) {
      return 'den items full'
    }

    return null
  }

  /**
   * Checks a world item is in the world items list
   * @param defId The world item's definition id
   * @returns Whether it is
   */
  private listed(defId: number): boolean {
    const list = this.lists.get(WORLD_ITEMS)
    if (!list) return false

    const ids = this.stock.shelf(list.defId)?.get(list.type) ?? list.ids

    return ids.includes(defId)
  }

  /**
   * Hands the gift to the player
   * @param session The session
   * @param player The player
   * @param gift The gift
   * @param balance The currency balance, or -1
   * @param invIdx The new thing's place in the inventory
   */
  private async deliver(
    session: Session,
    player: Player,
    gift: ClaimGift,
    balance: number,
    invIdx: number,
  ): Promise<void> {
    if ('amount' in gift) {
      player.wallet.set(gift.kind, balance)
      return
    }

    if (gift.kind === 'clothing') {
      player.items.add(
        new Item({ invId: invIdx, defId: gift.defId, color: gift.color }),
      )
      if (!player.avatar) return

      await session.send<ItemListOutgoing>(
        ItemListOutgoing.changed(player, player.avatar, {
          wear: false,
          color: gift.color,
          added: [{ invId: invIdx, defId: gift.defId }],
          removed: [],
        }),
      )
      return
    }

    player.denItems.push({
      invIdx,
      defId: gift.defId,
      categoryId: 0,
      version: gift.version,
      x: 0,
      y: 0,
      flipped: false,
      userNameLink: '',
      denStoreInvIdx: 0,
    })

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
}
