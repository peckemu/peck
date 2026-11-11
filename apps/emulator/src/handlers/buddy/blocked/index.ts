import { inject } from '@needle-di/core'
import { BlockInfoIncoming, BlockInfoOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PlayerFinder } from '#emulator/sessions/finder'

/**
 * Says whether a player blocks this one
 * @class
 */
@Handler(BlockInfoIncoming)
export class BlockInfoHandler extends PacketHandler<BlockInfoIncoming> {
  /**
   * Finds players
   */
  private readonly finder = inject<PlayerFinder>(PlayerFinder)

  /**
   * Looks the player up and answers
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: BlockInfoIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const other = await this.finder.find(packet.userName)
    const blocks = !!other && player.buddies.blockedBy.has(other.gameId)

    await session.send<BlockInfoOutgoing>(
      BlockInfoOutgoing.of(packet.room, packet.userName, blocks),
    )
  }
}
