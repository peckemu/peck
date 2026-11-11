import { inject } from '@needle-di/core'
import { AvatarRepository } from '@peck/database'
import {
  AvatarDataOutgoing,
  AvatarPaintIncoming,
  AvatarPaintOutgoing,
  NameBarOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { SessionManager } from '#emulator/sessions/manager'

/**
 * The bits a name bar has
 */
const NAME_BAR_BITS = 0x000fffff

/**
 * Recolours the player's animal
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(AvatarPaintIncoming)
export class AvatarPaintHandler extends PacketHandler<AvatarPaintIncoming> {
  /**
   * Keeps animals
   */
  private readonly avatars = inject<AvatarRepository>(AvatarRepository)

  /**
   * The sessions
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Saves the colours and shows the room
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: AvatarPaintIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const { avatar } = player
    if (!avatar) {
      return session.send<AvatarPaintOutgoing>(
        AvatarPaintOutgoing.refused(packet.room),
      )
    }

    const nameBarData = AvatarPaintHandler.isNameBar(packet.nameBar)
      ? packet.nameBar
      : player.nameBarData
    const renamed = nameBarData !== player.nameBarData

    avatar.colors = [packet.color1, packet.color2, packet.color3]
    player.nameBarData = nameBarData
    await this.avatars.paint(
      player.gameId,
      avatar.perUserId,
      avatar.colors,
      nameBarData,
    )

    await session.send<AvatarPaintOutgoing>(
      AvatarPaintOutgoing.painted(packet.room),
    )

    const { room } = player
    if (!room) return

    await this.sessions.broadcast<AvatarDataOutgoing>(
      room.id,
      AvatarDataOutgoing.other(room.id, player, avatar, player.petWith(avatar)),
      session,
    )

    if (renamed) {
      await this.sessions.broadcast<NameBarOutgoing>(
        room.id,
        NameBarOutgoing.of(room.id, player.id, nameBarData),
      )
    }
  }

  /**
   * Checks a name bar
   * @param nameBarData The name bar
   * @returns Whether it is
   */
  private static isNameBar(nameBarData: number): boolean {
    return (
      nameBarData >= 0 &&
      (nameBarData & ~NAME_BAR_BITS) === 0 &&
      ((nameBarData >> 16) & 0x0e) === 0
    )
  }
}
