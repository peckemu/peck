import { inject } from '@needle-di/core'
import { SilenceIncoming, SilenceOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { ModerationTools } from '#emulator/handlers/moderation/tools'

/**
 * Silences a player
 * @class
 */
@Throttle({ limit: 10, per: 10_000 })
@Handler(SilenceIncoming)
export class SilenceHandler extends PacketHandler<SilenceIncoming> {
  /**
   * The staff tools
   */
  private readonly tools = inject<ModerationTools>(ModerationTools)

  /**
   * Silences the player
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: SilenceIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const target = await this.tools.find(packet.userName)
    const refusal = await this.tools.refusal(player, target)
    if (refusal !== null || !target) {
      context.log.warn({ refusal }, 'silence refused')
      return session.send<SilenceOutgoing>(SilenceOutgoing.refused(packet.room))
    }

    const done = await this.tools.mute(
      player,
      target,
      packet.duration,
      packet.reasonId,
      packet.note,
    )

    await session.send<SilenceOutgoing>(
      done
        ? SilenceOutgoing.done(packet.room)
        : SilenceOutgoing.refused(packet.room),
    )
  }
}
