import { inject } from '@needle-di/core'
import {
  DenShopItemKind,
  DenShopRepository,
  type StandSale,
} from '@peck/database'
import { Item, type Player } from '@peck/game'
import {
  DenShopBuyIncoming,
  DenShopBuyOutgoing,
  type StandSaleView,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'
import { CURRENCIES } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PlayerFinder } from '#emulator/sessions/finder'
import { SessionManager } from '#emulator/sessions/manager'

/**
 * Buys from a den shop stand
 * @class
 */
@Handler(DenShopBuyIncoming)
export class DenShopBuyHandler extends PacketHandler<DenShopBuyIncoming> {
  /**
   * Finds players
   */
  private readonly finder = inject<PlayerFinder>(PlayerFinder)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Den shop stands
   */
  private readonly stands = inject<DenShopRepository>(DenShopRepository)

  /**
   * Buys from a stand
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DenShopBuyIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const seller = await this.finder.find(packet.sellerUserName)
    const refusal = this.refusal(packet, player, seller)
    if (refusal !== null || !seller) {
      context.log.info(
        { seller: packet.sellerUserName, refusal },
        'stand purchase refused',
      )
      return session.send<DenShopBuyOutgoing>(
        DenShopBuyOutgoing.refused(packet.room),
      )
    }

    const sold = await this.stands.buy({
      buyerGameId: player.gameId,
      sellerGameId: seller.gameId,
      storeInvIdx: packet.storeInvId,
      seen: Number.parseInt(packet.state, 10) || 0,
      itemKind: packet.itemKind,
      invIdx: packet.invIdx,
      currency: packet.currency,
      cost: packet.cost,
    })

    if ('refusal' in sold) {
      context.log.info(
        { seller: seller.username, refusal: sold.refusal },
        'stand purchase refused',
      )
      return session.send<DenShopBuyOutgoing>(
        DenShopBuyOutgoing.refused(packet.room),
      )
    }

    const view = this.view(packet, seller, sold)

    this.give(player, packet.itemKind, sold)
    DenShopBuyHandler.setBalance(player, packet.currency, sold.buyerBalance)

    await session.send<DenShopBuyOutgoing>(
      DenShopBuyOutgoing.toBuyer(
        packet.room,
        view,
        sold.buyerInvIdx,
        sold.state,
        sold.buyerBalance,
      ),
    )

    await this.tellSeller(seller, packet, view, sold)
  }

  /**
   * Checks a stand purchase
   * @param packet The packet
   * @param player The buyer
   * @param seller The seller
   * @returns The reason, or null
   */
  private refusal(
    packet: DenShopBuyIncoming,
    player: Player,
    seller: Player | null,
  ): string | null {
    const { itemKind } = packet
    if (
      itemKind !== DenShopItemKind.DenItem &&
      itemKind !== DenShopItemKind.Clothing
    ) {
      return 'not a kind'
    }

    if (!player.member) return 'members only'
    if (!seller) return 'no seller'
    if (player.room?.template.den?.ownerGameId !== seller.gameId) {
      return 'not in the den'
    }

    if (
      itemKind === DenShopItemKind.Clothing &&
      player.items.size >= player.clothingLimit
    ) {
      return 'no room'
    }
    if (
      itemKind === DenShopItemKind.DenItem &&
      player.denItems.length >= player.denItemLimit
    ) {
      return 'no room'
    }

    return null
  }

  /**
   * Describes the sale
   * @param packet The packet
   * @param seller The seller
   * @param sold What it came to
   * @returns The sale
   */
  private view(
    packet: DenShopBuyIncoming,
    seller: Player,
    sold: StandSale,
  ): StandSaleView {
    return {
      sellerUserName: seller.username,
      storeInvId: packet.storeInvId,
      listing: {
        itemKind: packet.itemKind,
        invIdx: packet.invIdx,
        currency: packet.currency,
        cost: packet.cost,
        defId: sold.defId,
        color: sold.color,
        version: sold.version,
      },
    }
  }

  /**
   * Gives the buyer what they bought
   * @param player The buyer
   * @param itemKind Its kind
   * @param sold What it came to
   */
  private give(player: Player, itemKind: number, sold: StandSale): void {
    if (itemKind === DenShopItemKind.Clothing) {
      player.items.add(
        new Item({
          invId: sold.buyerInvIdx,
          defId: sold.defId,
          color: sold.color,
        }),
      )
      return
    }

    player.denItems.push({
      invIdx: sold.buyerInvIdx,
      defId: sold.defId,
      categoryId: 0,
      version: sold.version,
      x: 0,
      y: 0,
      flipped: false,
      userNameLink: '',
      denStoreInvIdx: 0,
    })
  }

  /**
   * Tells the seller what they sold
   * @param seller The seller
   * @param packet The packet
   * @param view The sale
   * @param sold What it came to
   */
  private async tellSeller(
    seller: Player,
    packet: DenShopBuyIncoming,
    view: StandSaleView,
    sold: StandSale,
  ): Promise<void> {
    const session = this.sessions.byPlayer(seller.gameId)
    const online = session?.player
    if (!session || !online) return

    if (packet.itemKind === DenShopItemKind.Clothing) {
      if (online.items.get(packet.invIdx)) online.items.remove(packet.invIdx)
    } else {
      const kept = online.denItems.filter(
        ({ invIdx }) => invIdx !== packet.invIdx,
      )
      online.denItems.splice(0, online.denItems.length, ...kept)
    }

    DenShopBuyHandler.setBalance(online, packet.currency, sold.sellerBalance)

    await session.send<DenShopBuyOutgoing>(
      DenShopBuyOutgoing.toSeller(view, sold.sellerBalance),
    )
  }

  /**
   * Sets a player's balance in one currency
   * @param player The player
   * @param currency The currency
   * @param balance The balance
   */
  private static setBalance(
    player: Player,
    currency: number,
    balance: number,
  ): void {
    const name = CURRENCIES[currency]
    if (name) player.wallet.set(name, balance)
  }
}
