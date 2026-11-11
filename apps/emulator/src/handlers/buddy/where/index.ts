import { inject } from '@needle-di/core'
import { Presence } from '@peck/cluster'
import { RoomManager } from '@peck/game'
import { BuddyWhereIncoming, BuddyWhereOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * The den name prefix
 */
const DEN_PREFIX = 'den'

/**
 * Sends a buddy's location
 * @class
 */
@Handler(BuddyWhereIncoming)
export class BuddyWhereHandler extends PacketHandler<BuddyWhereIncoming> {
  /**
   * Who is playing where
   */
  private readonly presence = inject<Presence>(Presence)

  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * Finds the buddy and sends their room
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: BuddyWhereIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const buddy = player.buddies.get(packet.userName)
    const found = buddy ? await this.presence.get(buddy.gameId) : null

    if (!found?.room || found.invisible) {
      return session.send<BuddyWhereOutgoing>(
        BuddyWhereOutgoing.nowhere(packet.room),
      )
    }

    const [name = ''] = found.room.split('#')
    const template = this.rooms.template(name)

    const shown =
      name.startsWith(DEN_PREFIX) && !template
        ? {
            displayName: `${name.slice(DEN_PREFIX.length)}'s Den`,
            displayNameId: 0,
          }
        : {
            displayName: template?.sentName ?? name,
            displayNameId: template?.nameId ?? 0,
          }

    await session.send<BuddyWhereOutgoing>(
      BuddyWhereOutgoing.at(
        packet.room,
        found.room,
        shown.displayName,
        shown.displayNameId,
      ),
    )
  }
}
