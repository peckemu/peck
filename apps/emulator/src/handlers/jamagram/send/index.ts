import { inject } from '@needle-di/core'
import { JamagramRepository, type SendRefusal } from '@peck/database'
import {
  DenItemCatalogue,
  GenericListCatalogue,
  ItemCatalogue,
  type Player,
} from '@peck/game'
import {
  JamagramRefusal,
  JamagramSendIncoming,
  JamagramSendOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'
import { UserVar } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'
import {
  CLOTHING,
  DEN_ITEM,
  JamagramMail,
} from '#emulator/handlers/jamagram/mail'
import { PlayerFinder } from '#emulator/sessions/finder'
import { type Session } from '#emulator/sessions/session'
import { PlayerVariables } from '#emulator/sessions/variables'

/**
 * The cards players may pick
 */
const CARDS = 10

/**
 * The stamps players may pick
 */
const STAMPS = 44

/**
 * The longest typed message
 */
const LONGEST = 70

/**
 * A safe chat line
 */
const SAFE_CHAT = /^\d{1,2}(,\d{1,2})?$/

/**
 * The card limit per recipient
 */
const MOST = { buddy: 25, other: 5 } as const

/**
 * The interactions bit for Jam-a-Grams
 */
const CAN_SEND = 1 << 4

/**
 * The non-typing chat types
 */
const CANNOT_TYPE: ReadonlySet<number> = new Set([0, 3])

/**
 * The refusal codes
 */
const REPLIES: Record<SendRefusal, JamagramRefusal> = {
  player: JamagramRefusal.Refused,
  blocked: JamagramRefusal.NotAccepting,
  privacy: JamagramRefusal.NotAccepting,
  full: JamagramRefusal.Full,
  gift: JamagramRefusal.Refused,
}

/**
 * Sends a Jam-a-Gram
 * @class
 */
@Throttle({ limit: 10, per: 10_000 })
@Handler(JamagramSendIncoming)
export class JamagramSendHandler extends PacketHandler<JamagramSendIncoming> {
  /**
   * Keeps Jam-a-Grams
   */
  private readonly jamagrams = inject<JamagramRepository>(JamagramRepository)

  /**
   * Delivers Jam-a-Grams
   */
  private readonly mail = inject<JamagramMail>(JamagramMail)

  /**
   * Finds players
   */
  private readonly finder = inject<PlayerFinder>(PlayerFinder)

  /**
   * Every generic list
   */
  private readonly lists = inject<GenericListCatalogue>(GenericListCatalogue)

  /**
   * Every clothing item
   */
  private readonly items = inject<ItemCatalogue>(ItemCatalogue)

  /**
   * Every den item
   */
  private readonly denItems = inject<DenItemCatalogue>(DenItemCatalogue)

  /**
   * Raises the player's counters
   */
  private readonly variables = inject<PlayerVariables>(PlayerVariables)

  /**
   * Sends the card and its gift
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: JamagramSendIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const to = await this.finder.find(packet.userName)

    const refusal = this.refusal(packet, session, player, to?.gameId ?? 0)
    const giftName = this.giftName(packet, player)
    if (refusal !== null || !to || giftName === null) {
      context.log.info({ to: packet.userName, refusal }, 'jamagram refused')
      return session.send<JamagramSendOutgoing>(
        JamagramSendOutgoing.refused(packet.room),
      )
    }

    const result = await this.jamagrams.send({
      fromGameId: player.gameId,
      toGameId: to.gameId,
      cardMediaId: packet.cardMediaId,
      stampMediaId: packet.stampMediaId,
      message: packet.message,
      messageType: packet.messageType,
      type: packet.type,
      giftInvIdx: packet.giftInvIdx,
      giftName,
      specialType: packet.specialType === 1 ? 1 : 0,
    })
    if ('refusal' in result) {
      context.log.info(
        { to: packet.userName, refusal: result.refusal },
        'jamagram refused',
      )
      return session.send<JamagramSendOutgoing>(
        JamagramSendOutgoing.refused(packet.room, REPLIES[result.refusal]),
      )
    }

    this.mail.count(session, to.gameId)
    if (result.taken) await this.mail.take(session, player, result.taken)

    await this.variables.raise(session, UserVar.JamAGramsSent, 1)
    if (result.taken) await this.variables.raise(session, UserVar.GiftsSent, 1)

    await this.mail.publish({
      type: 'jamagram-sent',
      to: to.gameId,
      id: result.card.id,
    })
    await session.send<JamagramSendOutgoing>(
      JamagramSendOutgoing.sent(packet.room),
    )
  }

  /**
   * Checks a card can be sent
   * @param packet The packet
   * @param session The player's session
   * @param player The player
   * @param toGameId The recipient
   * @returns The reason, or null
   */
  private refusal(
    packet: JamagramSendIncoming,
    session: Session,
    player: Player,
    toGameId: number,
  ): string | null {
    if (toGameId === 0 || toGameId === player.gameId) return 'player'
    if (packet.message === '') return 'message'

    const most = player.buddies.has(packet.userName) ? MOST.buddy : MOST.other
    if (this.mail.sentTo(session, toGameId) >= most) return 'limit'

    if (packet.messageType === 1 && !SAFE_CHAT.test(packet.message)) {
      return 'message'
    }
    if (packet.messageType !== 1 && !this.canType(player, packet.message)) {
      return 'message'
    }
    if (packet.messageType !== 1 && player.muted()) return 'muted'

    if (!this.offered(CARDS, packet.cardMediaId)) return 'card'
    if (!this.offered(STAMPS, packet.stampMediaId)) return 'stamp'

    return null
  }

  /**
   * Finds a gift's name
   * @param packet The packet
   * @param player The player
   * @returns The name, or null
   */
  private giftName(
    packet: JamagramSendIncoming,
    player: Player,
  ): string | null {
    if (packet.type === 0) return ''
    if (!player.member) return null

    if (packet.type === CLOTHING) {
      const item = player.items.get(packet.giftInvIdx)
      if (!item || item.wornBy.size > 0 || item.denStoreInvIdx !== 0) {
        return null
      }

      return String(this.items.get(item.defId)?.titleStrId ?? 0)
    }

    if (packet.type !== DEN_ITEM) return null

    const item = player.denItems.find(
      ({ invIdx }) => invIdx === packet.giftInvIdx,
    )
    if (
      item?.categoryId !== 0 ||
      item.denStoreInvIdx !== 0 ||
      item.masterpiece
    ) {
      return null
    }
    if (
      this.denItems.isStand(item.defId) ||
      this.denItems.isMannequin(item.defId)
    ) {
      return null
    }

    return String(this.denItems.get(item.defId)?.nameStrId ?? 0)
  }

  /**
   * Checks the player can type a message
   * @param player The player
   * @param message The message
   * @returns Whether they can
   */
  private canType(player: Player, message: string): boolean {
    if (message.length > LONGEST) return false

    return (
      (player.interactions & CAN_SEND) !== 0 &&
      !CANNOT_TYPE.has(player.chatType)
    )
  }

  /**
   * Checks a card or stamp
   * @param listId The list
   * @param mediaId The card or stamp
   * @returns Whether it is
   */
  private offered(listId: number, mediaId: number): boolean {
    const ids = this.lists.get(listId)?.ids ?? []

    return ids.length === 0 || ids.includes(mediaId)
  }
}
