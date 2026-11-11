import { inject } from '@needle-di/core'
import {
  GenericListCatalogue,
  MASTERPIECE_FRAME_LISTS,
  WALL_ART_LISTS,
  GenericListContents,
  type Shelf,
  ShopStock,
} from '@peck/game'
import {
  type GenericListGroup,
  GenericListIncoming,
  GenericListOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'
import { PacketFactory } from '@peck/protocol'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * A list of media
 */
const MEDIA = 1033

/**
 * The combined list type
 */
const COMBINED = 1060

/**
 * The clothing list type
 */
const CLOTHING = 1000

/**
 * Lists the client can't take empty
 * @sxip These lists should not be sent empty to the client otherwise it causes issues i found, why? no idea, just observed it
 */
const UNSAFE_EMPTY = {
  ids: new Set([16, 401, 416, 424, 624]),
  types: new Set([1037]),
}

/**
 * Sends a generic list
 * @class
 */
@Handler(GenericListIncoming)
export class GenericListHandler extends PacketHandler<GenericListIncoming> {
  /**
   * Every generic list
   */
  private readonly lists = inject<GenericListCatalogue>(GenericListCatalogue)

  /**
   * The shop stock
   */
  private readonly stock = inject<ShopStock>(ShopStock)

  /**
   * The generic list contents
   */
  private readonly contents = inject<GenericListContents>(GenericListContents)

  /**
   * Sends the wanted list
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: GenericListIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const contents = this.contents.get(packet.listId)
    if (contents) {
      const reply = PacketFactory.raw('gl', packet.room).int(packet.listId)
      for (const field of contents) reply.string(field)

      return context.session.send(reply)
    }

    const frames =
      MASTERPIECE_FRAME_LISTS.get(packet.listId) ??
      WALL_ART_LISTS.get(packet.listId)
    if (frames) {
      const head = {
        listId: packet.listId,
        listType: MEDIA,
        diamondCost: 0,
        diamondBundle: false,
      }

      return context.session.send<GenericListOutgoing>(
        GenericListOutgoing.media(head, frames, packet.room),
      )
    }

    const list = this.lists.get(packet.listId)
    if (!list) return

    const shelf = this.stock.shelf(list.defId)
    const ids = shelf?.get(list.type) ?? list.ids

    const empty = ids.length === 0 && !shelf
    if (
      empty &&
      (UNSAFE_EMPTY.ids.has(list.defId) || UNSAFE_EMPTY.types.has(list.type))
    ) {
      return
    }

    const head = {
      listId: list.defId,
      listType: list.type,
      diamondCost: list.diamondCost,
      diamondBundle: list.diamondBundle,
    }

    const reply =
      list.type === COMBINED
        ? GenericListOutgoing.combined(
            head,
            this.groups(shelf, list.ids),
            packet.room,
          )
        : GenericListOutgoing.ids(head, ids, packet.room)

    await context.session.send<GenericListOutgoing>(reply)
  }

  /**
   * Splits a combined list into its groups
   * @param shelf What the shop sells
   * @param ids The list's own ids
   * @returns The groups
   */
  private groups(
    shelf: Shelf | null,
    ids: readonly number[],
  ): GenericListGroup[] {
    if (!shelf) return [{ listType: CLOTHING, ids }]

    return [...shelf].map(([listType, stocked]) => ({ listType, ids: stocked }))
  }
}
