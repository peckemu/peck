import { inject } from '@needle-di/core'
import { PLAYER_DAMAGE } from '@peck/game'
import {
  QuestEatIncoming,
  QuestPlantAteIncoming,
  QuestPlantAteOutgoing,
  QuestPlantIncoming,
  QuestPlantOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { QuestRunner } from '#emulator/handlers/quest/runner'

/**
 * Plants a seed
 * @class
 */
@Handler(QuestPlantIncoming)
export class QuestPlantHandler extends PacketHandler<QuestPlantIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Grows the plant for everyone
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestPlantIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player } = context

    const adventure = this.runner.playing(player.gameId)
    if (!adventure) return

    await this.runner.tell(
      adventure,
      QuestPlantOutgoing.planted(
        adventure.room?.id ?? packet.room,
        player.username,
        {
          actorName: adventure.spawn('plant'),
          defId: packet.defId,
          x: packet.x,
          y: packet.y,
          launcherUserId: player.id,
        },
      ),
    )
  }
}

/**
 * Says a plant bit a phantom
 * @class
 */
@Handler(QuestEatIncoming)
export class QuestEatHandler extends PacketHandler<QuestEatIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Hurts the phantom
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestEatIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { session } = context

    const adventure = this.runner.playing(context.player.gameId)
    if (!adventure) return

    await this.runner.strike(
      adventure,
      packet.phantomActorId,
      PLAYER_DAMAGE,
      session,
    )
  }
}

/**
 * Says a plant started eating
 * @class
 */
@Handler(QuestPlantAteIncoming)
export class QuestPlantAteHandler extends PacketHandler<QuestPlantAteIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Plays the bite for everyone
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestPlantAteIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const adventure = this.runner.playing(context.player.gameId)
    if (!adventure) return

    await this.runner.tell(
      adventure,
      QuestPlantAteOutgoing.of(
        adventure.room?.id ?? packet.room,
        packet.plantActorId,
        packet.phantomActorId,
      ),
    )
  }
}
