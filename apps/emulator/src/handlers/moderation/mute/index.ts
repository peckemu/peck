import { inject } from '@needle-di/core'
import { MuteIncoming, MuteOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { ModerationTools } from '#emulator/handlers/moderation/tools'

/**
 * Mutes a player
 * @class
 */
@Throttle({ limit: 10, per: 10_000 })
@Handler(MuteIncoming)
export class MuteHandler extends PacketHandler<MuteIncoming> {
  /**
   * The staff tools
   */
  private readonly tools = inject<ModerationTools>(ModerationTools)

  /**
   * Mutes the player
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: MuteIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const target = await this.tools.find(packet.userName)
    const refusal = await this.tools.refusal(player, target)
    if (refusal !== null || !target) {
      context.log.warn({ refusal }, 'mute refused')
      return session.send<MuteOutgoing>(MuteOutgoing.refused(packet.room))
    }

    const done = await this.tools.mute(
      player,
      target,
      packet.duration,
      0,
      packet.note,
    )

    await session.send<MuteOutgoing>(
      done ? MuteOutgoing.done(packet.room) : MuteOutgoing.refused(packet.room),
    )
  }
}
