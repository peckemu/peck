import { inject } from '@needle-di/core'
import { type Avatar, type Player } from '@peck/game'
import {
  AvatarListIncoming,
  AvatarListOutgoing,
  type OwnAvatars,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PlayerFinder } from '#emulator/sessions/finder'

/**
 * Lists a player's avatars
 * @class
 */
@Handler(AvatarListIncoming)
export class AvatarListHandler extends PacketHandler<AvatarListIncoming> {
  /**
   * Finds players
   */
  private readonly finder = inject<PlayerFinder>(PlayerFinder)

  /**
   * Sends a player's avatar list
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: AvatarListIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    if (packet.userName.toLowerCase() === player.username.toLowerCase()) {
      return session.send<AvatarListOutgoing>(
        AvatarListOutgoing.own(packet.room, own(player)),
      )
    }

    const other = await this.finder.find(packet.userName)
    const ids = other ? ordered(other).map(({ perUserId }) => perUserId) : []

    await session.send<AvatarListOutgoing>(
      AvatarListOutgoing.others(packet.room, packet.userName, ids),
    )
  }
}

/**
 * Lists a player's own avatars
 * @param player The player
 * @returns The list
 */
const own = (player: Player): OwnAvatars => ({
  userName: player.username,
  slotFlags: player.avatarSlotFlags,
  uuid: player.uuid,
  avatars: ordered(player).map((avatar) => ({
    perUserAvId: avatar.perUserId,
    avInvId: avatar.invId,
    avName: avatar.name,
    avTypeId: avatar.typeId,
    customAvId: avatar.customId,
  })),
})

/**
 * Puts the active avatar first
 * @param player The player
 * @returns Their avatars
 */
const ordered = (player: Player): Avatar[] => {
  const rest = [...player.avatars].filter((avatar) => avatar !== player.avatar)

  return player.avatar ? [player.avatar, ...rest] : rest
}
