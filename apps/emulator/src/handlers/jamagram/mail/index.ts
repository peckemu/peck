import { inject, injectable } from '@needle-di/core'
import {
  type BuddyEvent,
  type ClusterGift,
  ClusterEvents,
  type JamagramEvent,
} from '@peck/cluster'
import { type InboxCard, JamagramRepository } from '@peck/database'
import { DenItemCatalogue, Item, ItemCatalogue, type Player } from '@peck/game'
import { type Logger } from '@peck/logger'
import {
  DenItemsOutgoing,
  ItemListOutgoing,
  JamagramPushOutgoing,
  type ShownJamagram,
} from '@peck/packets'

import { type Session } from '#emulator/sessions/session'
import { SessionManager } from '#emulator/sessions/manager'
import { LoggerToken } from '#emulator/tokens'

/**
 * A card with clothing on it
 */
export const CLOTHING = 1

/**
 * A card with a den item on it
 */
export const DEN_ITEM = 3

/**
 * A card from AJHQ
 */
const AJHQ = 1

/**
 * AJHQ's name string
 */
const AJHQ_NAME = '25477'

/**
 * The account type AJHQ's cards show
 */
const AJHQ_ACCOUNT = 2

/**
 * Delivers Jam-a-Grams and moves their gifts
 * @class
 */
@injectable()
export class JamagramMail {
  /**
   * Keeps Jam-a-Grams
   */
  private readonly jamagrams = inject<JamagramRepository>(JamagramRepository)

  /**
   * Events between nodes
   */
  private readonly events =
    inject<ClusterEvents<BuddyEvent | JamagramEvent>>(ClusterEvents)

  /**
   * Every clothing item
   */
  private readonly items = inject<ItemCatalogue>(ItemCatalogue)

  /**
   * Every den item
   */
  private readonly denItems = inject<DenItemCatalogue>(DenItemCatalogue)

  /**
   * The sessions
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * The logger
   */
  private readonly logger = inject<Logger>(LoggerToken)

  /**
   * Sent cards by player
   */
  private readonly sent = new WeakMap<Session, Map<number, number>>()

  /**
   * Starts listening for cards and gifts
   */
  public async start(): Promise<void> {
    await this.events.listen((event) => {
      if (event.type !== 'jamagram-sent' && event.type !== 'jamagram-gift') {
        return
      }

      void this.receive(event).catch((error: unknown) => {
        this.logger.warn(
          { err: error, type: event.type },
          'jamagram event failed',
        )
      })
    })
  }

  /**
   * Tells every node something
   * @param event The event
   */
  public async publish(event: JamagramEvent): Promise<void> {
    await this.events.publish(event)
  }

  /**
   * Counts a session's sent cards
   * @param session The session
   * @param gameId The recipient
   * @returns How many
   */
  public sentTo(session: Session, gameId: number): number {
    return this.sent.get(session)?.get(gameId) ?? 0
  }

  /**
   * Counts a card a session sent
   * @param session The session
   * @param gameId The recipient
   */
  public count(session: Session, gameId: number): void {
    const counts = this.sent.get(session) ?? new Map<number, number>()
    counts.set(gameId, (counts.get(gameId) ?? 0) + 1)

    this.sent.set(session, counts)
  }

  /**
   * A card view
   * @param inbox The card
   * @returns The card
   */
  public show(inbox: InboxCard): ShownJamagram {
    const { card } = inbox
    const giftId =
      card.type === CLOTHING
        ? (this.items.get(card.giftId)?.accId ?? card.giftId)
        : card.giftId
    const ajhq = card.senderType === AJHQ

    return {
      id: card.id,
      senderName: ajhq ? AJHQ_NAME : inbox.senderName,
      cardMediaId: card.cardMediaId,
      stampMediaId: card.stampMediaId,
      read: card.read,
      message: card.message,
      type: card.type,
      giftId,
      giftColor: card.giftColor,
      giftName: card.giftName,
      senderAccountType: ajhq ? AJHQ_ACCOUNT : inbox.senderAccountType,
      senderType: card.senderType,
      specialType: card.specialType,
    }
  }

  /**
   * Takes a gift out of a player's inventory
   * @param session The player's session
   * @param player The player
   * @param gift The gift
   */
  public async take(
    session: Session,
    player: Player,
    gift: ClusterGift,
  ): Promise<void> {
    if (gift.type === CLOTHING) {
      if (player.items.get(gift.invIdx)) player.items.remove(gift.invIdx)

      return this.sendClothing(session, player, [], [gift.invIdx])
    }

    const index = player.denItems.findIndex(
      ({ invIdx }) => invIdx === gift.invIdx,
    )
    if (index !== -1) player.denItems.splice(index, 1)

    await this.sendDenItems(session, player)
  }

  /**
   * Puts a gift in a player's inventory
   * @param session The player's session
   * @param player The player
   * @param gift The gift
   */
  public async give(
    session: Session,
    player: Player,
    gift: ClusterGift,
  ): Promise<void> {
    if (gift.type === CLOTHING) {
      player.items.add(
        new Item({ invId: gift.invIdx, defId: gift.defId, color: gift.color }),
      )

      return this.sendClothing(
        session,
        player,
        [{ invId: gift.invIdx, defId: gift.defId }],
        [],
      )
    }

    player.denItems.push({
      invIdx: gift.invIdx,
      defId: gift.defId,
      categoryId: 0,
      version: gift.version,
      x: 0,
      y: 0,
      flipped: false,
      userNameLink: '',
      denStoreInvIdx: 0,
      uniqueImageId: '',
    })

    await this.sendDenItems(session, player)
  }

  /**
   * Handles player news
   * @param event The news
   */
  private async receive(event: JamagramEvent): Promise<void> {
    const session = this.sessions.byPlayer(event.to)
    const player = session?.player
    if (!session || !player) return

    if (event.type === 'jamagram-gift') {
      return this.give(session, player, event.gift)
    }

    const card = await this.jamagrams.card(event.to, event.id)
    if (!card) return

    await session.send<JamagramPushOutgoing>(
      JamagramPushOutgoing.of(this.show(card)),
    )
  }

  /**
   * Tells a player their clothing changed
   * @param session The player's session
   * @param player The player
   * @param added The items added
   * @param removed The items taken
   */
  private async sendClothing(
    session: Session,
    player: Player,
    added: readonly { readonly invId: number; readonly defId: number }[],
    removed: readonly number[],
  ): Promise<void> {
    const { avatar } = player
    if (!avatar) return

    await session.send<ItemListOutgoing>(
      ItemListOutgoing.changed(player, avatar, {
        wear: false,
        color: 0,
        added,
        removed,
      }),
    )
  }

  /**
   * Sends a player their den items
   * @param session The player's session
   * @param player The player
   */
  private async sendDenItems(session: Session, player: Player): Promise<void> {
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
