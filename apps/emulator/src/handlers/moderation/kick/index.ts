import { inject } from '@needle-di/core'
import { KickIncoming, KickOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { ModerationTools } from '#emulator/handlers/moderation/tools'

/**
 * Kicks a player
 * @class
 */
@Throttle({ limit: 10, per: 10_000 })
@Handler(KickIncoming)
export class KickHandler extends PacketHandler<KickIncoming> {
  /**
   * The staff tools
   */
  private readonly tools = inject<ModerationTools>(ModerationTools)

  /**
   * Kicks the player
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: KickIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const target = await this.tools.find(packet.userName)
    const refusal = await this.tools.refusal(player, target)
    if (refusal !== null || !target) {
      context.log.warn({ refusal }, 'kick refused')
      return session.send<KickOutgoing>(KickOutgoing.refused(packet.room))
    }

    const kicked = await this.tools.kick(player, target, packet.note)

    await session.send<KickOutgoing>(
      kicked
        ? KickOutgoing.done(packet.room)
        : KickOutgoing.refused(packet.room),
    )
  }
}
