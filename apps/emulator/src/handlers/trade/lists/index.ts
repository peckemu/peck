import { injectable } from '@needle-di/core'
import { type Player, TradeRules } from '@peck/game'
import { TradeListOutgoing } from '@peck/packets'

import { type Session } from '#emulator/sessions/session'

/**
 * Sends trade lists
 * @class
 */
@injectable()
export class TradeLists {
  /**
   * Builds a player's trade list
   * @param room The target room
   * @param player The player
   * @returns The packet
   */
  public of(room: number, player: Player): TradeListOutgoing {
    return TradeListOutgoing.of(
      room,
      player.username,
      TradeRules.contents(player),
    )
  }

  /**
   * Sends a player their own trade list
   * @param session The player's session
   */
  public async sendOwn(session: Session): Promise<void> {
    const { player } = session
    if (!player) return

    await session.send<TradeListOutgoing>(this.of(-1, player))
  }
}
