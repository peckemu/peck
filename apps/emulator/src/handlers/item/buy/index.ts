import { inject } from '@needle-di/core'
import { ShopRepository } from '@peck/database'
import {
  Item,
  ItemCatalogue,
  type Offer,
  type Player,
  Prices,
  ShopStock,
} from '@peck/game'
import {
  BuyStatus,
  ItemBuyIncoming,
  ItemBuyOutgoing,
  ItemListOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'
import { ShopListType, UserVar } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PlayerVariables } from '#emulator/sessions/variables'

/**
 * Buys clothing
 * @class
 */
@Handler(ItemBuyIncoming)
export class ItemBuyHandler extends PacketHandler<ItemBuyIncoming> {
  /**
   * Works out prices
   */
  private readonly prices = inject<Prices>(Prices)

  /**
   * The shop stock
   */
  private readonly stock = inject<ShopStock>(ShopStock)

  /**
   * Every clothing item
   */
  private readonly items = inject<ItemCatalogue>(ItemCatalogue)

  /**
   * Pays for things
   */
  private readonly shops = inject<ShopRepository>(ShopRepository)

  /**
   * Raises the player's counters
   */
  private readonly variables = inject<PlayerVariables>(PlayerVariables)

  /**
   * Buys the item
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: ItemBuyIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const { avatar } = player
    if (!avatar) return

    const offer = this.prices.clothing(packet.defId, packet.diamond === 1)
    const color = offer
      ? this.items.get(offer.defId)?.colors[packet.colorIndex]
      : undefined

    const refusal = this.refusal(packet, player, offer, color)
    if (refusal !== null || !offer || color === undefined) {
      context.log.info({ defId: packet.defId, refusal }, 'clothing not bought')
      return session.send<ItemBuyOutgoing>(
        ItemBuyOutgoing.refused(
          packet.room,
          packet.shopId,
          refusal ?? BuyStatus.Refused,
        ),
      )
    }

    const bought = await this.shops.buy(player.gameId, {
      kind: 'clothing',
      shopId: packet.shopId,
      diamondDefId: offer.diamondDefId,
      costs: offer.price.costs,
      defId: offer.defId,
      color,
    })

    if (!bought) {
      context.log.info({ defId: offer.defId }, 'clothing not paid for')
      return session.send<ItemBuyOutgoing>(
        ItemBuyOutgoing.refused(packet.room, packet.shopId),
      )
    }

    player.wallet.update(bought.balances)
    player.items.add(
      new Item({ invId: bought.invIdx, defId: offer.defId, color }),
    )

    await this.variables.purchased(
      session,
      offer.price,
      UserVar.ClothingBuyCount,
    )

    const balance = Prices.balance(offer.price, player.wallet)
    await session.send<ItemBuyOutgoing>(
      ItemBuyOutgoing.bought(
        packet.room,
        packet.shopId,
        balance,
        offer.price.currency,
      ),
    )
    await session.send<ItemListOutgoing>(
      ItemListOutgoing.changed(player, avatar, {
        wear: true,
        color,
        added: [{ invId: bought.invIdx, defId: offer.defId }],
        removed: [],
      }),
    )
  }

  /**
   * Finds why clothing can't be bought
   * @param packet The packet
   * @param player The player
   * @param offer What it costs
   * @param color The wanted colour
   * @returns The reason, or null
   */
  private refusal(
    packet: ItemBuyIncoming,
    player: Player,
    offer: Offer | null,
    color: number | undefined,
  ): BuyStatus | null {
    if (packet.targetInvId !== -1 || packet.targetUserName !== '') {
      return BuyStatus.Refused
    }
    if (!offer) return BuyStatus.Gone

    const sold = this.stock.sells(
      packet.shopId,
      ShopListType.Clothing,
      offer.defId,
      offer.diamondDefId,
    )
    if (!sold) return BuyStatus.Gone

    if (offer.membersOnly && !player.member) return BuyStatus.Refused
    if (player.items.size >= player.clothingLimit) return BuyStatus.Refused
    if (color === undefined || offer.price.costs.length === 0) {
      return BuyStatus.Refused
    }

    return null
  }
}
