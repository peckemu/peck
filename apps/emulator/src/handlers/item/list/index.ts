import { inject } from '@needle-di/core'
import { ItemListIncoming, ItemListOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PlayerFinder } from '#emulator/sessions/finder'

/**
 * Lists an avatar's items
 * @class
 */
@Handler(ItemListIncoming)
export class ItemListHandler extends PacketHandler<ItemListIncoming> {
  /**
   * Finds players
   */
  private readonly finder = inject<PlayerFinder>(PlayerFinder)

  /**
   * Sends the items
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: ItemListIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const owner = await this.finder.find(packet.userName)
    const avatar = owner?.findAvatar(packet.perUserAvId)

    if (!owner || !avatar) {
      context.log.info({ userName: packet.userName }, 'no such avatar')
      return
    }

    const full = packet.full === 1 && owner === context.player

    const list = full
      ? ItemListOutgoing.inventory(packet.room, owner, avatar, [...owner.items])
      : ItemListOutgoing.worn(packet.room, owner, avatar, owner.worn(avatar))

    await context.session.send<ItemListOutgoing>(list)
  }
}
