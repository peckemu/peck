import { inject } from '@needle-di/core'
import {
  QuestDropIncoming,
  QuestMovedItemsIncoming,
  QuestMovedItemsOutgoing,
  QuestPickUpIncoming,
  QuestPickUpOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { QuestRunner } from '#emulator/handlers/quest/runner'

/**
 * Picks up an item
 * @class
 */
@Handler(QuestPickUpIncoming)
export class QuestPickUpHandler extends PacketHandler<QuestPickUpIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Hands the player the item
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestPickUpIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const adventure = this.runner.playing(player.gameId)
    if (!adventure?.actor(packet.actorId)) return

    const roomId = adventure.room?.id ?? packet.room
    const picked = adventure.pickUp(player.gameId, packet.actorId)
    if (picked.result === 'holding') {
      return session.send<QuestPickUpOutgoing>(
        QuestPickUpOutgoing.holding(roomId, picked.heldItem),
      )
    }
    if (picked.result === 'taken') {
      return session.send<QuestPickUpOutgoing>(
        QuestPickUpOutgoing.refused(roomId),
      )
    }

    await this.runner.tell(
      adventure,
      QuestPickUpOutgoing.pickedUp(roomId, packet.actorId, player.id),
    )
  }
}

/**
 * Drops an item
 * @class
 */
@Handler(QuestDropIncoming)
export class QuestDropHandler extends PacketHandler<QuestDropIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Puts the item down
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestDropIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player } = context

    const adventure = this.runner.playing(player.gameId)
    const { actorId, x, y } = packet
    if (!adventure?.drop(player.gameId, actorId, x, y)) return

    await this.runner.tell(
      adventure,
      QuestPickUpOutgoing.dropped(
        adventure.room?.id ?? packet.room,
        actorId,
        player.id,
        x,
        y,
      ),
    )
  }
}

/**
 * Asks where items were moved
 * @class
 */
@Handler(QuestMovedItemsIncoming)
export class QuestMovedItemsHandler extends PacketHandler<QuestMovedItemsIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Lists the moved items
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestMovedItemsIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const adventure = this.runner.playing(player.gameId)
    const items = (adventure?.movedItems() ?? []).map((spot) => ({
      ...spot,
      innerRadius: 0,
      outerRadius: 0,
    }))

    await session.send<QuestMovedItemsOutgoing>(
      QuestMovedItemsOutgoing.of(packet.room, items),
    )
  }
}
