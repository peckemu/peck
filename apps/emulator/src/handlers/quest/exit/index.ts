import { inject } from '@needle-di/core'
import { QuestExitIncoming } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '../../../dispatch/context/index.ts'
import { QuestRunner } from '../runner/index.ts'

/**
 * Leaves an adventure
 * @class
 */
@Handler(QuestExitIncoming)
export class QuestExitHandler extends PacketHandler<QuestExitIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Takes the player out of their adventure
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestExitIncoming,
    context: HandlerContext,
  ): Promise<void> {
    await this.runner.exit(context.session, packet.exitType)
  }
}
