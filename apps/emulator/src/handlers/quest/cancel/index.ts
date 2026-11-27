import { inject } from '@needle-di/core'
import { QuestCancelIncoming } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '../../../dispatch/context/index.ts'
import { QuestRunner } from '../runner/index.ts'

/**
 * Leaves an adventure lobby
 * @class
 */
@Handler(QuestCancelIncoming)
export class QuestCancelHandler extends PacketHandler<QuestCancelIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Takes the player out of their lobby
   * @param _packet The packet
   * @param context The packet context
   */
  public async handle(
    _packet: QuestCancelIncoming,
    context: HandlerContext,
  ): Promise<void> {
    await this.runner.leaveLobby(context.session)
  }
}
