import { inject } from '@needle-di/core'
import { BuddyRepository } from '@peck/database'
import {
  BlockIncoming,
  BlockOutgoing,
  BuddyRemoveOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { BuddyService } from '#emulator/cluster/buddies'
import { type HandlerContext } from '#emulator/dispatch/context'
import { PlayerFinder } from '#emulator/sessions/finder'

/**
 * Blocks a player
 * @class
 */
@Throttle({ limit: 10, per: 30_000 })
@Handler(BlockIncoming)
export class BlockHandler extends PacketHandler<BlockIncoming> {
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
   * Blocks them
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: BlockIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const target = await this.finder.find(packet.userName)
    if (!target || target.gameId === player.gameId) {
      return session.send<BlockOutgoing>(
        BlockOutgoing.of(packet.room, packet.userName, false),
      )
    }

    const wereBuddies = await this.repository.block(
      player.gameId,
      target.gameId,
    )
    player.buddies.block({ gameId: target.gameId, username: target.username })

    if (wereBuddies) {
      await session.send<BuddyRemoveOutgoing>(
        BuddyRemoveOutgoing.of(-1, target.username),
      )
      await this.buddies.publish({
        type: 'buddy-removed',
        to: target.gameId,
        username: player.username,
      })
    }

    await this.buddies.publish({
      type: 'block',
      to: target.gameId,
      blockerGameId: player.gameId,
      on: true,
    })
    await session.send<BlockOutgoing>(
      BlockOutgoing.of(packet.room, packet.userName, true),
    )
  }
}
