import { inject } from '@needle-di/core'
import { type Avatar, type Player } from '@peck/game'
import {
  AvatarLookupByIdIncoming,
  AvatarLookupIncoming,
  AvatarLookupOutgoing,
  type LookedUpExtras,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PlayerFinder } from '#emulator/sessions/finder'
import { SessionManager } from '#emulator/sessions/manager'

/**
 * Looks a player up by name
 * @class
 */
@Throttle({ limit: 10, per: 5_000 })
@Handler(AvatarLookupIncoming)
export class AvatarLookupHandler extends PacketHandler<AvatarLookupIncoming> {
  /**
   * The sessions
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Finds players
   */
  private readonly finder = inject<PlayerFinder>(PlayerFinder)

  /**
   * Sends the player's animal
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: AvatarLookupIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { session } = context

    const online = this.sessions.byUsername(packet.userName)?.player ?? null
    const found = online ?? (await this.finder.find(packet.userName))

    if (!found) {
      return session.send<AvatarLookupOutgoing>(
        AvatarLookupOutgoing.missing(packet.room, packet.userName),
      )
    }

    const { avatar } = found
    if (!avatar) {
      return session.send<AvatarLookupOutgoing>(
        AvatarLookupOutgoing.archived(packet.room, packet.userName),
      )
    }

    const extras = extrasOf(found, avatar)

    await session.send<AvatarLookupOutgoing>(
      online
        ? AvatarLookupOutgoing.online(packet.room, found, avatar, extras)
        : AvatarLookupOutgoing.offline(packet.room, found, avatar, extras),
    )
  }
}

/**
 * Looks a player up by room id
 * @class
 */
@Throttle({ limit: 10, per: 5_000 })
@Handler(AvatarLookupByIdIncoming)
export class AvatarLookupByIdHandler extends PacketHandler<AvatarLookupByIdIncoming> {
  /**
   * The sessions
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Sends the player's animal
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: AvatarLookupByIdIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { session } = context

    const found = this.sessions.get(packet.userId)?.player
    const avatar = found?.avatar

    if (!found || !avatar) {
      context.log.info({ userId: packet.userId }, 'no such player')
      return
    }

    await session.send<AvatarLookupOutgoing>(
      AvatarLookupOutgoing.online(
        packet.room,
        found,
        avatar,
        extrasOf(found, avatar),
      ),
    )
  }
}

/**
 * Finds a player's extras
 * @param player The player
 * @param avatar Their animal
 * @returns The pet and clothing
 */
const extrasOf = (player: Player, avatar: Avatar): LookedUpExtras => ({
  pet: player.petWith(avatar),
  items: player.worn(avatar),
})
