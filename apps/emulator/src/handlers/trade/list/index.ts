import { inject } from '@needle-di/core'
import { TradeListIncoming, TradeListOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { TradeLists } from '#emulator/handlers/trade/lists'
import { SessionManager } from '#emulator/sessions/manager'

/**
 * Sends a player's trade list
 * @class
 */
@Handler(TradeListIncoming)
export class TradeListHandler extends PacketHandler<TradeListIncoming> {
  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Sends trade lists
   */
  private readonly lists = inject<TradeLists>(TradeLists)

  /**
   * Sends a local player's list
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: TradeListIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const owner = this.sessions.byUsername(packet.userName)?.player

    const list = owner
      ? this.lists.of(packet.room, owner)
      : TradeListOutgoing.of(packet.room, packet.userName, {
          clothing: [],
          denItems: [],
          pets: [],
        })

    await context.session.send<TradeListOutgoing>(list)
  }
}
