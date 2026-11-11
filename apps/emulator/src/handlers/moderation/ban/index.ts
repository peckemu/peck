import { inject } from '@needle-di/core'
import { BanIncoming, BanOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { ModerationTools } from '#emulator/handlers/moderation/tools'

/**
 * Bans a player
 * @class
 */
@Throttle({ limit: 10, per: 10_000 })
@Handler(BanIncoming)
export class BanHandler extends PacketHandler<BanIncoming> {
  /**
   * The staff tools
   */
  private readonly tools = inject<ModerationTools>(ModerationTools)

  /**
   * Bans the player
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: BanIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const target = await this.tools.find(packet.userName)
    const refusal = await this.tools.refusal(player, target)
    if (refusal !== null || !target) {
      context.log.warn({ refusal }, 'ban refused')
      return session.send<BanOutgoing>(BanOutgoing.refused(packet.room))
    }

    await this.tools.ban(
      player,
      target,
      packet.duration,
      packet.reasonId,
      packet.note,
    )

    await session.send<BanOutgoing>(BanOutgoing.done(packet.room))
  }
}
