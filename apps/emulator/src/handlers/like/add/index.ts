import { inject } from '@needle-di/core'
import { LikeRepository } from '@peck/database'
import { LikeIncoming, LikeOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { LikeTargets } from '#emulator/handlers/like/targets'

/**
 * Likes a wall or a masterpiece
 * @class
 */
@Throttle({ limit: 10, per: 5_000 })
@Handler(LikeIncoming)
export class LikeHandler extends PacketHandler<LikeIncoming> {
  /**
   * Keeps likes
   */
  private readonly likes = inject<LikeRepository>(LikeRepository)

  /**
   * Checks what can be liked
   */
  private readonly targets = inject<LikeTargets>(LikeTargets)

  /**
   * Keeps the like
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: LikeIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const type = await this.targets.type(packet.resourceType, packet.resourceId)
    const liked = type
      ? await this.likes.like(type, packet.resourceId, context.player.gameId)
      : false

    await context.reply<LikeOutgoing>(LikeOutgoing, {
      room: packet.room,
      result: liked ? 1 : 0,
    })
  }
}
