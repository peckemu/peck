import { inject } from '@needle-di/core'
import { Trades } from '@peck/game'
import { TradeBusyIncoming } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Sends the trade window state
 * @class
 */
@Handler(TradeBusyIncoming)
export class TradeBusyHandler extends PacketHandler<TradeBusyIncoming> {
  /**
   * The trades in progress
   */
  private readonly trades = inject<Trades>(Trades)

  /**
   * Tracks busy players
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: TradeBusyIncoming,
    context: HandlerContext,
  ): Promise<void> {
    this.trades.setBusy(context.player.gameId, packet.busy === 1)

    await Promise.resolve()
  }
}
