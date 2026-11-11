import { inject } from '@needle-di/core'
import { AvatarRepository } from '@peck/database'
import { ItemCatalogue, Wardrobe } from '@peck/game'
import {
  ItemListOutgoing,
  ItemUseIncoming,
  ItemUseOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { SessionManager } from '#emulator/sessions/manager'

/**
 * The most items one change names
 */
const MOST_ITEMS = 40

/**
 * Dresses the player's animal
 * @class
 */
@Throttle({ limit: 10, per: 5_000 })
@Handler(ItemUseIncoming)
export class ItemUseHandler extends PacketHandler<ItemUseIncoming> {
  /**
   * Keeps animals
   */
  private readonly avatars = inject<AvatarRepository>(AvatarRepository)

  /**
   * Every clothing item
   */
  private readonly items = inject<ItemCatalogue>(ItemCatalogue)

  /**
   * The sessions
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Dresses the animal
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: ItemUseIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const { avatar } = player
    const ids = packet.invIds.map(Number)
    const valid =
      packet.wearCount >= 0 &&
      packet.removeCount >= 0 &&
      packet.wearCount + packet.removeCount === ids.length &&
      ids.length <= MOST_ITEMS &&
      ids.every((id) => Number.isInteger(id))

    const dressed =
      avatar && valid
        ? new Wardrobe(this.items).dress(
            player,
            avatar,
            ids.slice(0, packet.wearCount),
            ids.slice(packet.wearCount),
          )
        : { refusal: 'unreadable' }

    if (!avatar || 'refusal' in dressed) {
      context.log.info(
        { refusal: 'refusal' in dressed ? dressed.refusal : 'no avatar' },
        'dressing refused',
      )
      return session.send<ItemUseOutgoing>(ItemUseOutgoing.refused(packet.room))
    }

    await this.avatars.dress(
      player.gameId,
      {
        perUserAvId: avatar.perUserId,
        eyesDefId: avatar.eyesDefId,
        patternDefId: avatar.patternDefId,
      },
      dressed.changed.flatMap((invId) => {
        const item = player.items.get(invId)
        return item ? [{ invId, equippedAvatars: item.equippedAvatars }] : []
      }),
    )

    await session.send<ItemListOutgoing>(
      ItemListOutgoing.changed(player, avatar, {
        wear: false,
        color: 0,
        added: dressed.added,
        removed: dressed.removed,
      }),
    )
    await session.send<ItemUseOutgoing>(ItemUseOutgoing.dressed(packet.room))

    const { room } = player
    if (!room) return

    await this.sessions.broadcast<ItemListOutgoing>(
      room.id,
      ItemListOutgoing.worn(-1, player, avatar, player.worn(avatar)),
      session,
    )
  }
}
