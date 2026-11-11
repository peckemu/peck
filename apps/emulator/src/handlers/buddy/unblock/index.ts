import { inject } from '@needle-di/core'
import { BuddyRepository } from '@peck/database'
import { UnblockIncoming, UnblockOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { BuddyService } from '#emulator/cluster/buddies'
import { type HandlerContext } from '#emulator/dispatch/context'
import { PlayerFinder } from '#emulator/sessions/finder'

/**
 * Unblocks a player
 * @class
 */
@Throttle({ limit: 10, per: 30_000 })
@Handler(UnblockIncoming)
export class UnblockHandler extends PacketHandler<UnblockIncoming> {
  /**
   * Finds players
   */
  private readonly finder = inject<PlayerFinder>(PlayerFinder)

  /**
   * The buddies and blocks
   */
  private readonly repository = inject<BuddyRepository>(BuddyRepository)

  /**
   * Buddies across the cluster
   */
  private readonly buddies = inject<BuddyService>(BuddyService)

  /**
   * Unblocks them
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: UnblockIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const target = await this.finder.find(packet.userName)
    if (!target) {
      return session.send<UnblockOutgoing>(
        UnblockOutgoing.of(packet.room, packet.userName, false),
      )
    }

    await this.repository.unblock(player.gameId, target.gameId)
    player.buddies.unblock(target.username)

    await this.buddies.publish({
      type: 'block',
      to: target.gameId,
      blockerGameId: player.gameId,
      on: false,
    })
    await session.send<UnblockOutgoing>(
      UnblockOutgoing.of(packet.room, packet.userName, true),
    )
  }
}
