import { inject } from '@needle-di/core'
import {
  AvatarDataIncoming,
  AvatarDataOutgoing,
  ItemListOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PlayerFinder } from '#emulator/sessions/finder'

/**
 * No items
 */
const NONE = 0

/**
 * Every item
 */
const ALL = 1

/**
 * Sends one of a player's avatars
 * @class
 */
@Handler(AvatarDataIncoming)
export class AvatarDataHandler extends PacketHandler<AvatarDataIncoming> {
  /**
   * Finds players
   */
  private readonly finder = inject<PlayerFinder>(PlayerFinder)

  /**
   * Sends the avatar
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: AvatarDataIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { session } = context

    const owner = await this.finder.find(packet.userName)
    const avatar = owner?.findAvatar(packet.perUserAvId)

    if (!owner || !avatar) {
      context.log.info({ userName: packet.userName }, 'no such avatar')
      return
    }

    const own = owner === context.player

    await session.send<AvatarDataOutgoing>(
      own
        ? AvatarDataOutgoing.own(
            owner,
            avatar,
            avatar.invId,
            owner.pets.get(avatar.landPetInvIdx)?.invId ?? 0,
            owner.pets.get(avatar.oceanPetInvIdx)?.invId ?? 0,
          )
        : AvatarDataOutgoing.other(
            packet.room,
            owner,
            avatar,
            owner.petWith(avatar),
          ),
    )

    if (packet.items === NONE) return

    const full = own && packet.items === ALL

    const list = full
      ? ItemListOutgoing.inventory(packet.room, owner, avatar, [...owner.items])
      : ItemListOutgoing.worn(packet.room, owner, avatar, owner.worn(avatar))

    await session.send<ItemListOutgoing>(list)
  }
}
