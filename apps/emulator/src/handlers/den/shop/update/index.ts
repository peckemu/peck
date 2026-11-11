import { inject } from '@needle-di/core'
import {
  DenShopItemKind,
  DenShopRepository,
  type ListingChange,
} from '@peck/database'
import { Den, DenItemCatalogue, type Player } from '@peck/game'
import { DenShopUpdateIncoming, DenShopUpdateOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * A stand change
 */
type StandChange = {
  /**
   * Listings added or changed
   */
  readonly upserts: ListingChange[]

  /**
   * Listings taken off
   */
  readonly removals: Pick<ListingChange, 'itemKind' | 'invIdx'>[]
}

/**
 * Changes the player's stand stock
 * @class
 */
@Handler(DenShopUpdateIncoming)
export class DenShopUpdateHandler extends PacketHandler<DenShopUpdateIncoming> {
  /**
   * Every den item
   */
  private readonly denItems = inject<DenItemCatalogue>(DenItemCatalogue)

  /**
   * Den shop stands
   */
  private readonly stands = inject<DenShopRepository>(DenShopRepository)

  /**
   * Makes the change
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DenShopUpdateIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const store = packet.storeInvId

    const change = DenShopUpdateHandler.read(packet.body)
    const refusal = change ? this.refusal(player, store, change) : 'unreadable'
    if (refusal !== null || !change) {
      context.log.info({ store, refusal }, 'stand change refused')
      return session.send<DenShopUpdateOutgoing>(
        DenShopUpdateOutgoing.refused(packet.room),
      )
    }

    const seen = Number.parseInt(packet.state, 10) || 0
    const result = await this.stands.update(
      player.gameId,
      store,
      seen,
      change.upserts,
      change.removals,
    )

    if ('refusal' in result) {
      context.log.info(
        { store, refusal: result.refusal },
        'stand change refused',
      )
      return session.send<DenShopUpdateOutgoing>(
        DenShopUpdateOutgoing.refused(packet.room),
      )
    }

    DenShopUpdateHandler.mark(player, store, change)

    await session.send<DenShopUpdateOutgoing>(
      DenShopUpdateOutgoing.updated(packet.room, result.state),
    )
  }

  /**
   * Checks a stand change
   * @param player The player
   * @param store The stand
   * @param change The change
   * @returns The reason, or null
   */
  private refusal(
    player: Player,
    store: number,
    change: StandChange,
  ): string | null {
    const stand = player.denItems.find(({ invIdx }) => invIdx === store)
    if (!stand || !this.denItems.isStand(stand.defId)) return 'not a stand'

    for (const upsert of change.upserts) {
      if (!this.listable(player, store, upsert)) return 'not listable'
    }

    const kinds: readonly number[] = Object.values(DenShopItemKind)
    if (change.removals.some(({ itemKind }) => !kinds.includes(itemKind))) {
      return 'not a kind'
    }

    return null
  }

  /**
   * Checks something can go on the stand
   * @param player The player
   * @param store The stand
   * @param upsert The listing
   * @returns Whether it can
   */
  private listable(
    player: Player,
    store: number,
    upsert: ListingChange,
  ): boolean {
    if (upsert.itemKind === DenShopItemKind.Clothing) {
      return player.items.get(upsert.invIdx) !== null
    }
    if (
      upsert.itemKind !== DenShopItemKind.DenItem ||
      upsert.invIdx === store
    ) {
      return false
    }

    const item = player.denItems.find(({ invIdx }) => invIdx === upsert.invIdx)

    if (!item || Den.unapproved(item)) return false

    return (
      !this.denItems.isStand(item.defId) &&
      !this.denItems.isMannequin(item.defId)
    )
  }

  /**
   * Reads the listings changed and taken off
   * @param body The other fields
   * @returns The change, or null
   */
  private static read(body: readonly string[]): StandChange | null {
    const numbers = body.map(Number)
    if (!numbers.every(Number.isSafeInteger)) return null

    const [upsertCount = 0] = numbers
    const upserts = Array.from({ length: upsertCount }, (_, index) => {
      const [itemKind = -1, invIdx = 0, currency = -1, cost = 0] =
        numbers.slice(1 + index * 4)

      return { itemKind, invIdx, currency, cost }
    })

    const removalsAt = 1 + upsertCount * 4
    const removalCount = numbers[removalsAt] ?? 0
    const removals = Array.from({ length: removalCount }, (_, index) => {
      const [itemKind = -1, invIdx = 0] = numbers.slice(
        removalsAt + 1 + index * 2,
      )

      return { itemKind, invIdx }
    })

    return { upserts, removals }
  }

  /**
   * Marks stand items
   * @param player The player
   * @param store The stand
   * @param change The change made
   */
  private static mark(
    player: Player,
    store: number,
    change: StandChange,
  ): void {
    const set = (
      itemKind: number,
      invIdx: number,
      to: number,
      only?: number,
    ): void => {
      if (itemKind === DenShopItemKind.Clothing) {
        const item = player.items.get(invIdx)
        if (item && (only === undefined || item.denStoreInvIdx === only)) {
          item.denStoreInvIdx = to
        }
        return
      }

      const index = player.denItems.findIndex((item) => item.invIdx === invIdx)
      const item = player.denItems[index]
      if (item && (only === undefined || item.denStoreInvIdx === only)) {
        player.denItems[index] = { ...item, denStoreInvIdx: to }
      }
    }

    for (const { itemKind, invIdx } of change.removals) {
      set(itemKind, invIdx, 0, store)
    }
    for (const { itemKind, invIdx } of change.upserts) {
      set(itemKind, invIdx, store)
    }
  }
}
