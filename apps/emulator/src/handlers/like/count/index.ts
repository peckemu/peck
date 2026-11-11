import { inject } from '@needle-di/core'
import { LikeRepository } from '@peck/database'
import { LikesIncoming, LikesOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { LikeTargets } from '#emulator/handlers/like/targets'

/**
 * Sends a like count
 * @class
 */
@Throttle({ limit: 10, per: 5_000 })
@Handler(LikesIncoming)
export class LikesHandler extends PacketHandler<LikesIncoming> {
  /**
   * Keeps likes
   */
  private readonly likes = inject<LikeRepository>(LikeRepository)

  /**
   * Checks what can be liked
   */
  private readonly targets = inject<LikeTargets>(LikeTargets)

  /**
   * Sends the count
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: LikesIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const type = await this.targets.type(packet.resourceType, packet.resourceId)
    const likes = type
      ? await this.likes.of(type, packet.resourceId, context.player.gameId)
      : null

    await context.reply<LikesOutgoing>(LikesOutgoing, {
      room: packet.room,
      result: likes ? 1 : 0,
      liked: likes?.liked ? 1 : 0,
      count: likes?.count ?? 0,
    })
  }
}
