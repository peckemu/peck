import { inject, injectable } from '@needle-di/core'
import {
  type BuddyEvent,
  ClusterEvents,
  type MasterpieceEvent,
} from '@peck/cluster'
import { MasterpieceRepository } from '@peck/database'
import { DenItemCatalogue, type Player, RoomManager } from '@peck/game'
import { type Logger } from '@peck/logger'
import {
  CurrencyOutgoing,
  DenItemsOutgoing,
  DenStateOutgoing,
} from '@peck/packets'

import { type Session } from '#emulator/sessions/session'
import { SessionManager } from '#emulator/sessions/manager'
import { LoggerToken } from '#emulator/tokens'

/**
 * The diamonds currency
 */
const DIAMONDS = 3

/**
 * Keeps den item masterpieces
 * @class
 */
@injectable()
export class MasterpieceFrames {
  /**
   * Keeps masterpieces
   */
  private readonly masterpieces = inject<MasterpieceRepository>(
    MasterpieceRepository,
  )

  /**
   * Events from other nodes
   */
  private readonly events =
    inject<ClusterEvents<BuddyEvent | MasterpieceEvent>>(ClusterEvents)

  /**
   * Every den item
   */
  private readonly denItems = inject<DenItemCatalogue>(DenItemCatalogue)

  /**
   * The rooms
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * The sessions
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * The logger
   */
  private readonly logger = inject<Logger>(LoggerToken)

  /**
   * Starts listening
   */
  public async start(): Promise<void> {
    await this.events.listen((event) => {
      if (event.type !== 'masterpiece-decided') return

      void this.decided(event).catch((error: unknown) => {
        this.logger.warn({ err: error }, 'masterpiece decision failed')
      })
    })
  }

  /**
   * Adds a player's masterpieces
   * @param player The player
   */
  public async dress(player: Player): Promise<void> {
    const found = await this.masterpieces.byIds(
      player.denItems.map(({ uniqueImageId }) => uniqueImageId ?? ''),
    )
    if (found.size === 0) return

    for (const [index, item] of player.denItems.entries()) {
      const art = found.get(item.uniqueImageId ?? '')
      if (!art) continue

      player.denItems[index] = {
        ...item,
        masterpiece: {
          uniqueImageId: art.uniqueImageId,
          approved: art.approved,
          creatorGameId: art.creatorGameId,
          creatorUuid: art.creatorUuid,
        },
      }
    }
  }

  /**
   * Sends a player their den items
   * @param session The player's session
   * @param player The player
   */
  public async sendItems(session: Session, player: Player): Promise<void> {
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
   * Applies a staff decision
   * @param event The decision
   */
  private async decided(event: MasterpieceEvent): Promise<void> {
    const session = this.sessions.byPlayer(event.gameId)
    const player = session?.player
    if (!session || !player) return

    const framed = player.denItems.filter(
      ({ masterpiece }) => masterpiece?.uniqueImageId === event.uniqueImageId,
    )

    for (let index = player.denItems.length - 1; index >= 0; index -= 1) {
      const item = player.denItems[index]
      if (!item?.masterpiece || !framed.includes(item)) continue

      if (event.approved) {
        player.denItems[index] = {
          ...item,
          masterpiece: { ...item.masterpiece, approved: true },
        }
      } else {
        player.denItems.splice(index, 1)
      }
    }

    if (event.token) {
      player.denItems.push({
        invIdx: event.token.invIdx,
        defId: event.token.defId,
        categoryId: 0,
        version: 0,
        x: 0,
        y: 0,
        flipped: false,
        userNameLink: '',
        denStoreInvIdx: 0,
        uniqueImageId: '',
      })
    }

    player.wallet.set('diamonds', event.diamonds)
    await session.send<CurrencyOutgoing>(
      CurrencyOutgoing.of(DIAMONDS, event.diamonds),
    )
    await this.sendItems(session, player)

    const placed = framed.filter(({ categoryId }) => categoryId !== 0)
    const den = this.rooms.instancesOf(`den${player.username}`)[0]
    if (!den || placed.length === 0) return

    const shown = placed.map((item) => ({
      ...item,
      categoryId: event.approved ? item.categoryId : 0,
      masterpiece: item.masterpiece
        ? { ...item.masterpiece, approved: event.approved }
        : undefined,
      mannequin: false,
    }))
    await this.sessions.broadcast<DenStateOutgoing>(
      den.id,
      DenStateOutgoing.of(den.id, shown),
    )
  }
}
