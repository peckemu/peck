import { inject } from '@needle-di/core'
import { BuddyListIncoming, BuddyListOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { BuddyService } from '#emulator/cluster/buddies'
import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Sends the buddy and blocked lists
 * @class
 */
@Handler(BuddyListIncoming)
export class BuddyListHandler extends PacketHandler<BuddyListIncoming> {
  /**
   * Buddies across the cluster
   */
  private readonly buddies = inject<BuddyService>(BuddyService)

  /**
   * Sends the buddies and blocks
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: BuddyListIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const online = await this.buddies.online(player)
    const buddies = [...player.buddies]

    await session.send<BuddyListOutgoing>(
      BuddyListOutgoing.buddies(
        packet.room,
        buddies.filter(({ gameId }) => online.has(gameId)),
        buddies.filter(({ gameId }) => !online.has(gameId)),
      ),
    )
    await session.send<BuddyListOutgoing>(
      BuddyListOutgoing.blocked(packet.room, player.buddies.blockedUsernames),
    )
  }
}
