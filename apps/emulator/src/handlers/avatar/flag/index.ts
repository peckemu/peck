import { inject } from '@needle-di/core'
import { PlayerRepository } from '@peck/database'
import { AvatarPendingFlagIncoming } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'
import { PendingFlag } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * The bit the client may set
 */
const CLIENT_FLAG = 0

/**
 * Sets a pending flag
 * @class
 */
@Throttle({ limit: 3, per: 5_000 })
@Handler(AvatarPendingFlagIncoming)
export class AvatarPendingFlagHandler extends PacketHandler<AvatarPendingFlagIncoming> {
  /**
   * The players
   */
  private readonly players = inject<PlayerRepository>(PlayerRepository)

  /**
   * Sets the flag and keeps it
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: AvatarPendingFlagIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player } = context

    const refusal = this.refusal(packet.flag)
    if (refusal !== null) {
      context.log.info({ flag: packet.flag, refusal }, 'pending flag refused')
      return
    }

    player.pendingFlags |= PendingFlag.FirstFiveMinutes
    await this.players.flag(player.gameId, player.pendingFlags)
  }

  /**
   * Finds why a flag can't be set
   * @param flag The flag's bit
   * @returns The reason, or null
   */
  private refusal(flag: number): string | null {
    if (flag !== CLIENT_FLAG) return 'only the server sets it'

    return null
  }
}
