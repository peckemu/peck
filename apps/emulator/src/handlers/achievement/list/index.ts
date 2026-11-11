import { inject } from '@needle-di/core'
import { AchievementRepository } from '@peck/database'
import { AchievementsIncoming, AchievementsOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Lists a player's achievements
 * @class
 */
@Throttle({ limit: 10, per: 10_000 })
@Handler(AchievementsIncoming)
export class AchievementsHandler extends PacketHandler<AchievementsIncoming> {
  /**
   * Keeps achievements
   */
  private readonly achievements = inject<AchievementRepository>(
    AchievementRepository,
  )

  /**
   * Sends the achievements
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: AchievementsIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const achievements = await this.achievements.of(packet.userName)

    await context.session.send<AchievementsOutgoing>(
      AchievementsOutgoing.of(packet.userName, achievements ?? []),
    )
  }
}
