import { inject } from '@needle-di/core'
import { PlayerRepository } from '@peck/database'
import { NewspaperSeenIncoming, NewspaperSeenOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Marks a newspaper page seen
 * @class
 */
@Handler(NewspaperSeenIncoming)
export class NewspaperSeenHandler extends PacketHandler<NewspaperSeenIncoming> {
  /**
   * The players
   */
  private readonly players = inject<PlayerRepository>(PlayerRepository)

  /**
   * Marks a page as seen
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: NewspaperSeenIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const seenTs = Math.floor(Date.now() / 1000)

    player.newspapersSeen.set(packet.defId, seenTs)
    await this.players.seeNewspaper(player.gameId, packet.defId, seenTs)

    await session.send<NewspaperSeenOutgoing>(
      NewspaperSeenOutgoing.of(packet.room, packet.defId, seenTs),
    )
  }
}
