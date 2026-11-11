import { inject } from '@needle-di/core'
import {
  MASTERPIECE_ID,
  MASTERPIECE_TOKEN,
  type Purchase,
  ShopRepository,
} from '@peck/database'
import {
  type DenItemMasterpiece,
  DenItemCatalogue,
  type Offer,
  type Player,
  Prices,
  ShopStock,
} from '@peck/game'
import {
  BuyStatus,
  DenBuyIncoming,
  DenBuyOutgoing,
  DenItemsOutgoing,
  DenRoomsOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'
import { InventoryLimit, ShopListType, UserVar } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'
import { type Session } from '#emulator/sessions/session'
import { PlayerVariables } from '#emulator/sessions/variables'

/**
 * A den room is bought
 */
const ROOM = -1

/**
 * The most looks a den item has
 */
const MOST_VERSIONS = 255

/**
 * The art studio frame
 */
const MASTERPIECE_FRAME = 221

/**
 * Buys a den item or den room
 * @class
 */
@Handler(DenBuyIncoming)
export class DenBuyHandler extends PacketHandler<DenBuyIncoming> {
  /**
   * Works out prices
   */
  private readonly prices = inject<Prices>(Prices)

  /**
   * The shop stock
   */
  private readonly stock = inject<ShopStock>(ShopStock)

  /**
   * Every den item
   */
  private readonly denItems = inject<DenItemCatalogue>(DenItemCatalogue)

  /**
   * Pays for things
   */
  private readonly shops = inject<ShopRepository>(ShopRepository)

  /**
   * Raises the player's counters
   */
  private readonly variables = inject<PlayerVariables>(PlayerVariables)

  /**
   * Buys a den item or room
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DenBuyIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const room = packet.kind === ROOM
    const diamond = packet.diamond === 1

    const offer = room
      ? this.prices.denRoom(packet.defId, diamond)
      : this.prices.denItem(packet.defId, diamond)

    if (!room && packet.rest[0] === '1') {
      return this.frame(packet, context, offer)
    }

    const refusal = this.refusal(packet, player, offer)
    if (refusal !== null || !offer) {
      context.log.info({ defId: packet.defId, refusal }, 'den purchase refused')
      return session.send<DenBuyOutgoing>(
        DenBuyOutgoing.refused(packet.room, refusal ?? undefined),
      )
    }

    const purchase: Purchase = {
      kind: room ? 'den-room' : 'den-item',
      shopId: packet.shopId,
      diamondDefId: offer.diamondDefId,
      costs: offer.price.costs,
      defId: offer.defId,
      ...(room
        ? { slot: packet.versionOrSlot }
        : { version: packet.versionOrSlot }),
    }

    const bought = await this.shops.buy(player.gameId, purchase)
    if (!bought) {
      context.log.info({ defId: offer.defId }, 'den purchase not paid for')
      return session.send<DenBuyOutgoing>(DenBuyOutgoing.refused(packet.room))
    }

    player.wallet.update(bought.balances)
    await this.variables.purchased(
      session,
      offer.price,
      room ? undefined : UserVar.DenItemBuyCount,
    )

    const balance = Prices.balance(offer.price, player.wallet)
    await session.send<DenBuyOutgoing>(
      DenBuyOutgoing.bought(
        packet.room,
        balance,
        offer.price.currency,
        bought.invIdx,
      ),
    )

    if (room) return this.addRoom(session, player, bought.invIdx, offer.defId)

    await this.addItem(
      session,
      player,
      bought.invIdx,
      offer.defId,
      packet.versionOrSlot,
    )
  }

  /**
   * Gives a den room
   * @param session The player's session
   * @param player The player
   * @param invIdx Its slot
   * @param defId Its definition id
   */
  private async addRoom(
    session: Session,
    player: Player,
    invIdx: number,
    defId: number,
  ): Promise<void> {
    player.denRooms.push({ invIdx, defId })

    await session.send<DenRoomsOutgoing>(
      DenRoomsOutgoing.of(-1, player.denRooms),
    )
  }

  /**
   * Gives a den item
   * @param session The player's session
   * @param player The player
   * @param invIdx Its place in the inventory
   * @param defId Its definition id
   * @param version Which of its looks
   */
  private async addItem(
    session: Session,
    player: Player,
    invIdx: number,
    defId: number,
    version: number,
    masterpiece?: DenItemMasterpiece,
  ): Promise<void> {
    player.denItems.push({
      invIdx,
      defId,
      categoryId: 0,
      version,
      x: 0,
      y: 0,
      flipped: false,
      userNameLink: '',
      denStoreInvIdx: 0,
      uniqueImageId: masterpiece?.uniqueImageId ?? '',
      masterpiece,
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

  /**
   * Frames a masterpiece
   * @param packet The packet
   * @param context The packet context
   * @param offer The frame's price
   */
  private async frame(
    packet: DenBuyIncoming,
    context: HandlerContext,
    offer: Offer | null,
  ): Promise<void> {
    const { player, session } = context
    const [, usingTokens, uniqueImageId = ''] = packet.rest

    const refusal = this.frameRefusal(packet, player, offer, uniqueImageId)
    if (refusal !== null || !offer) {
      context.log.info({ refusal }, 'masterpiece frame refused')
      return session.send<DenBuyOutgoing>(
        DenBuyOutgoing.refused(packet.room, refusal ?? undefined),
      )
    }

    const purchase = {
      kind: 'den-item',
      shopId: packet.shopId,
      diamondDefId: offer.diamondDefId,
      costs: offer.price.costs,
      defId: offer.defId,
      version: packet.versionOrSlot,
      uniqueImageId,
    } as const

    const framed = await this.shops.frame(
      player.gameId,
      purchase,
      usingTokens === '1' ? MASTERPIECE_TOKEN : null,
    )
    if (!framed) {
      context.log.info({ uniqueImageId }, 'masterpiece frame not paid for')
      return session.send<DenBuyOutgoing>(DenBuyOutgoing.refused(packet.room))
    }

    player.wallet.update(framed.balances)
    if (framed.tokenInvIdx !== null) {
      const spent = player.denItems.findIndex(
        ({ invIdx }) => invIdx === framed.tokenInvIdx,
      )
      if (spent !== -1) player.denItems.splice(spent, 1)
    }

    const balance = Prices.balance(offer.price, player.wallet)
    await session.send<DenBuyOutgoing>(
      DenBuyOutgoing.bought(
        packet.room,
        balance,
        offer.price.currency,
        framed.invIdx,
      ),
    )

    await this.addItem(
      session,
      player,
      framed.invIdx,
      offer.defId,
      packet.versionOrSlot,
      {
        uniqueImageId,
        approved: false,
        creatorGameId: player.gameId,
        creatorUuid: player.uuid,
      },
    )
  }

  /**
   * Checks a frame can be bought
   * @param packet The packet
   * @param player The player
   * @param offer The frame's price
   * @param uniqueImageId The masterpiece
   * @returns The reason, or null
   */
  private frameRefusal(
    packet: DenBuyIncoming,
    player: Player,
    offer: Offer | null,
    uniqueImageId: string,
  ): BuyStatus | null {
    if (!offer) return BuyStatus.Gone
    if (offer.diamondDefId !== MASTERPIECE_FRAME) return BuyStatus.Refused
    if (!MASTERPIECE_ID.test(uniqueImageId)) return BuyStatus.Refused
    if (offer.membersOnly && !player.member) return BuyStatus.Refused
    if (player.denItems.length >= player.denItemLimit) return BuyStatus.Refused
    if (packet.versionOrSlot < 0 || packet.versionOrSlot > MOST_VERSIONS) {
      return BuyStatus.Refused
    }

    return null
  }

  /**
   * Checks a den item or room can be bought
   * @param packet The packet
   * @param player The player
   * @param offer What it costs
   * @returns The reason, or null
   */
  private refusal(
    packet: DenBuyIncoming,
    player: Player,
    offer: Offer | null,
  ): BuyStatus | null {
    const room = packet.kind === ROOM
    if (!offer) return BuyStatus.Gone

    const listType = room ? ShopListType.DenRooms : ShopListType.DenItems
    if (
      !this.stock.sells(
        packet.shopId,
        listType,
        offer.defId,
        offer.diamondDefId,
      )
    ) {
      return BuyStatus.Gone
    }

    if (offer.membersOnly && !player.member) return BuyStatus.Refused
    if (offer.price.costs.length === 0) return BuyStatus.Refused

    if (room) return DenBuyHandler.slotRefusal(player, packet.versionOrSlot)

    if (player.denItems.length >= player.denItemLimit) return BuyStatus.Refused
    if (packet.versionOrSlot < 0 || packet.versionOrSlot > MOST_VERSIONS) {
      return BuyStatus.Refused
    }

    return null
  }

  /**
   * Checks a den room slot is free
   * @param player The player
   * @param slot The slot
   * @returns The reason, or null
   */
  private static slotRefusal(player: Player, slot: number): BuyStatus | null {
    if (slot < 1 || slot > InventoryLimit.DenRoomSlot) return BuyStatus.Refused
    if (player.denRooms.some(({ invIdx }) => invIdx === slot)) {
      return BuyStatus.Refused
    }

    return null
  }
}
