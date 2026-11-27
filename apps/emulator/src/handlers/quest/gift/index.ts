import { inject } from '@needle-di/core'
import { QuestRepository } from '@peck/database'
import {
  QuestGiftIncoming,
  QuestGiftsDoneIncoming,
  QuestPlayerGiftIncoming,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '../../../dispatch/context/index.ts'
import { QuestRunner } from '../runner/index.ts'

/**
 * A gift picked
 */
type PickedGift = QuestGiftIncoming | QuestPlayerGiftIncoming

/**
 * Gives a picked gift
 * @param runner Runs adventures
 * @param packet The packet
 * @param context The packet context
 */
const pick = async (
  runner: QuestRunner,
  packet: PickedGift,
  context: HandlerContext,
): Promise<void> => {
  const { player, session } = context

  const adventure = runner.playing(player.gameId)
  if (!adventure) return

  if (packet.discarded === 1 || packet.index < 0) {
    adventure.discardGift(player.gameId)
    return
  }

  const prize = adventure.pickGift(player.gameId, packet.index)
  if (prize) await runner.award(session, adventure, prize)
}

/**
 * Picks a gift
 * @class
 */
@Handler(QuestGiftIncoming)
export class QuestGiftHandler extends PacketHandler<QuestGiftIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Gives the gift
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestGiftIncoming,
    context: HandlerContext,
  ): Promise<void> {
    await pick(this.runner, packet, context)
  }
}

/**
 * Picks a gift of their own
 * @class
 */
@Handler(QuestPlayerGiftIncoming)
export class QuestPlayerGiftHandler extends PacketHandler<QuestPlayerGiftIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Gives the gift
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestPlayerGiftIncoming,
    context: HandlerContext,
  ): Promise<void> {
    await pick(this.runner, packet, context)
  }
}

/**
 * Finishes picking gifts
 * @class
 */
@Handler(QuestGiftsDoneIncoming)
export class QuestGiftsDoneHandler extends PacketHandler<QuestGiftsDoneIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Adventure progress and prizes
   */
  private readonly repository = inject<QuestRepository>(QuestRepository)

  /**
   * Counts the adventure finished
   * @param _packet The packet
   * @param context The packet context
   */
  public async handle(
    _packet: QuestGiftsDoneIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player } = context

    const adventure = this.runner.playing(player.gameId)
    if (!adventure?.finish(player.gameId)) return

    const { defId } = adventure.template
    const times = await this.repository.complete(
      player.gameId,
      defId,
      adventure.difficulty,
    )
    context.log.info({ defId, times }, 'adventure finished')
  }
}
