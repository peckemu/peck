import { inject } from '@needle-di/core'
import { Adventures } from '@peck/game'
import { QuestCancelOutgoing, QuestKickIncoming } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '../../../dispatch/context/index.ts'
import { QuestRunner } from '../runner/index.ts'

/**
 * Kicks a player from a private lobby
 * @class
 */
@Handler(QuestKickIncoming)
export class QuestKickHandler extends PacketHandler<QuestKickIncoming> {
  /**
   * Every adventure being played
   */
  private readonly adventures = inject<Adventures>(Adventures)

  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Takes the player out of the host's lobby
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestKickIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player } = context

    const adventure = this.adventures.hostedBy(player.gameId)
    const kicked = context.sessions.byUsername(packet.userName)
    const target = kicked?.player
    if (!adventure || adventure.started || !kicked || !target) return
    if (target === player || this.adventures.of(target.gameId) !== adventure) {
      return
    }

    this.adventures.leave(target.gameId)
    await kicked.send<QuestCancelOutgoing>(QuestCancelOutgoing.of(-1))
    await this.runner.tellLobby(adventure)
  }
}
