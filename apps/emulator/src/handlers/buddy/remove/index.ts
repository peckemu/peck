import { inject } from '@needle-di/core'
import { BuddyRepository } from '@peck/database'
import { BuddyRemoveIncoming, BuddyRemoveOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { BuddyService } from '#emulator/cluster/buddies'
import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Ends a buddyship
 * @class
 */
@Handler(BuddyRemoveIncoming)
export class BuddyRemoveHandler extends PacketHandler<BuddyRemoveIncoming> {
  /**
   * The buddies and blocks
   */
  private readonly repository = inject<BuddyRepository>(BuddyRepository)

  /**
   * Buddies across the cluster
   */
  private readonly buddies = inject<BuddyService>(BuddyService)

  /**
   * Ends the buddyship
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: BuddyRemoveIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const buddy = player.buddies.get(packet.userName)
    if (
      !buddy ||
      !(await this.repository.remove(player.gameId, buddy.gameId))
    ) {
      return
    }

    player.buddies.remove(buddy.username)

    await session.send<BuddyRemoveOutgoing>(
      BuddyRemoveOutgoing.of(packet.room, buddy.username),
    )
    await this.buddies.publish({
      type: 'buddy-removed',
      to: buddy.gameId,
      username: player.username,
    })
  }
}
