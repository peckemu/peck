import { inject } from '@needle-di/core'
import { TradeRepository } from '@peck/database'
import { TradeRules } from '@peck/game'
import { TradeListChangeIncoming } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { TradeLists } from '#emulator/handlers/trade/lists'

/**
 * Changes the player's trade list
 * @class
 */
@Throttle({ limit: 10, per: 10_000 })
@Handler(TradeListChangeIncoming)
export class TradeListChangeHandler extends PacketHandler<TradeListChangeIncoming> {
  /**
   * Trade lists and trades
   */
  private readonly repository = inject<TradeRepository>(TradeRepository)

  /**
   * Sends trade lists
   */
  private readonly lists = inject<TradeLists>(TradeLists)

  /**
   * Saves the change
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: TradeListChangeIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const [removed, added] = TradeRules.readChange(packet.body)
    const asked = [
      ...player.tradeList.filter(
        (ref) => !removed.some((each) => TradeRules.same(each, ref)),
      ),
      ...added.filter(
        (ref) => !player.tradeList.some((each) => TradeRules.same(each, ref)),
      ),
    ]

    const kept = await this.repository.changeList(player.gameId, removed, added)
    player.tradeList = kept

    const same =
      kept.length === asked.length &&
      asked.every((ref) => kept.some((each) => TradeRules.same(each, ref)))
    if (!same) await this.lists.sendOwn(session)
  }
}
