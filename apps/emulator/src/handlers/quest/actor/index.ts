import { inject } from '@needle-di/core'
import {
  QuestPositionIncoming,
  QuestPositionOutgoing,
  QuestScrollIncoming,
  QuestScrollOutgoing,
  QuestSeekIncoming,
  QuestSeekOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '../../../dispatch/context/index.ts'
import { QuestRunner } from '../runner/index.ts'

/**
 * Says where an actor is
 * @class
 */
@Handler(QuestPositionIncoming)
export class QuestPositionHandler extends PacketHandler<QuestPositionIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Tells the others where it is
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestPositionIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player } = context

    const adventure = this.runner.playing(player.gameId)
    if (!adventure?.actor(packet.actorId)) return

    const moved = QuestPositionOutgoing.of(adventure.room?.id ?? packet.room, {
      actorId: packet.actorId,
      x: packet.x,
      y: packet.y,
      velocity: packet.velocity,
      seekType: packet.seekType,
      nearestX: packet.nearestX,
      nearestY: packet.nearestY,
    })
    await this.runner.tell(adventure, moved, player.gameId)
  }
}

/**
 * Asks an actor to seek
 * @class
 */
@Handler(QuestSeekIncoming)
export class QuestSeekHandler extends PacketHandler<QuestSeekIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Tells everyone what it seeks
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestSeekIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player } = context

    const adventure = this.runner.playing(player.gameId)
    if (!adventure?.actor(packet.actorId)) return

    await this.runner.tell(
      adventure,
      QuestSeekOutgoing.of(
        adventure.room?.id ?? packet.room,
        packet.actorId,
        packet.seekType,
        player.id,
      ),
    )
  }
}

/**
 * Moves in a side scrolling adventure
 * @class
 */
@Handler(QuestScrollIncoming)
export class QuestScrollHandler extends PacketHandler<QuestScrollIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Tells the others where the player went
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestScrollIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player } = context

    const adventure = this.runner.playing(player.gameId)
    if (!adventure) return

    player.position = { x: packet.x, y: packet.y }
    await this.runner.tell(
      adventure,
      QuestScrollOutgoing.of(
        adventure.room?.id ?? packet.room,
        player.id,
        [packet.x, packet.y],
        packet.flags,
      ),
      player.gameId,
    )
  }
}
