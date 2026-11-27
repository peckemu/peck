import { inject } from '@needle-di/core'
import { type Adventure, Adventures } from '@peck/game'
import { QuestStartIncoming, QuestStartOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '../../../dispatch/context/index.ts'
import { QuestRunner } from '../runner/index.ts'

/**
 * Starts an adventure
 * @class
 */
@Handler(QuestStartIncoming)
export class QuestStartHandler extends PacketHandler<QuestStartIncoming> {
  /**
   * Every adventure being played
   */
  private readonly adventures = inject<Adventures>(Adventures)

  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Starts the player's adventure
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestStartIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const adventure = this.adventures.of(player.gameId)
    const refusal = QuestStartHandler.refusal(adventure, player.gameId)
    if (refusal === null && adventure && (await this.runner.start(adventure))) {
      return
    }

    context.log.info(
      { refusal: refusal ?? 'no room' },
      'adventure start refused',
    )
    await session.send<QuestStartOutgoing>(
      QuestStartOutgoing.failed(packet.room, adventure?.template.defId ?? 0),
    )
  }

  /**
   * Checks a player can start their adventure
   * @param adventure The adventure, or null
   * @param gameId The player
   * @returns The reason, or null
   */
  private static refusal(
    adventure: Adventure | null,
    gameId: number,
  ): string | null {
    if (!adventure) return 'not in a lobby'
    if (adventure.started) return 'already started'
    if (adventure.host !== null && adventure.host !== gameId) {
      return 'not the host'
    }
    if (adventure.size < adventure.template.avatarMin) return 'too few players'

    return null
  }
}
