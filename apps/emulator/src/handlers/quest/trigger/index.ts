import { inject } from '@needle-di/core'
import { type Adventure, type AdventureActor } from '@peck/game'
import {
  QuestCrystalsOutgoing,
  QuestDeathOutgoing,
  QuestGiftsOutgoing,
  QuestTreasureIncoming,
  QuestTreasureOutgoing,
  QuestTriggerIncoming,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'
import { QuestActorType, QuestPrizeKind } from '@peck/shared'

import { type HandlerContext } from '../../../dispatch/context/index.ts'
import { QuestRunner } from '../runner/index.ts'
import { type Session } from '../../../sessions/session/index.ts'

/**
 * Sets off an actor
 * @class
 */
@Handler(QuestTriggerIncoming)
export class QuestTriggerHandler extends PacketHandler<QuestTriggerIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Answers the actor
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestTriggerIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const adventure = this.runner.playing(player.gameId)
    const actor = adventure?.actor(packet.actorId) ?? null
    if (!adventure || !actor) return

    const roomId = adventure.room?.id ?? packet.room
    if (
      actor.actorId === adventure.template.giftActor &&
      adventure.mayOpenGifts(player.gameId)
    ) {
      await session.send<QuestGiftsOutgoing>(
        QuestGiftsOutgoing.of(
          roomId,
          adventure.template.popupType,
          adventure.template.gifts,
        ),
      )
    }

    switch (actor.template.type) {
      case QuestActorType.Treasure:
      case QuestActorType.DroppedTreasure:
        return this.treasure(session, adventure, actor, roomId)
      case QuestActorType.Pickup:
        return this.pickup(session, adventure, actor, roomId)
      default:
        return this.reward(session, adventure, actor)
    }
  }

  /**
   * Offers a treasure's prize
   * @param session The player's session
   * @param adventure The adventure
   * @param actor The treasure
   * @param roomId The adventure's room
   */
  private async treasure(
    session: Session,
    adventure: Adventure,
    actor: AdventureActor,
    roomId: number,
  ): Promise<void> {
    const gameId = session.player?.gameId ?? -1
    if (actor.claimed.has(gameId)) return

    const { prize, membersOnly } = actor.template
    if (!prize) {
      return session.send<QuestTreasureOutgoing>(
        QuestTreasureOutgoing.opened(roomId, actor.actorId),
      )
    }

    adventure.offer(gameId, actor.actorId, prize)
    await session.send<QuestTreasureOutgoing>(
      QuestTreasureOutgoing.of(roomId, actor.actorId, prize, membersOnly),
    )
  }

  /**
   * Takes a pickup
   * @param session The player's session
   * @param adventure The adventure
   * @param actor The pickup
   * @param roomId The adventure's room
   */
  private async pickup(
    session: Session,
    adventure: Adventure,
    actor: AdventureActor,
    roomId: number,
  ): Promise<void> {
    const gameId = session.player?.gameId ?? -1
    if (actor.done) return

    actor.done = true
    await this.runner.tell(
      adventure,
      QuestDeathOutgoing.of(roomId, actor.actorId, 0),
    )

    const { prize } = actor.template
    const amount = prize?.kind === QuestPrizeKind.Crystals ? prize.value : 1
    const crystals = adventure.gather(gameId, amount)
    if (crystals !== null) {
      await session.send<QuestCrystalsOutgoing>(
        QuestCrystalsOutgoing.of(roomId, crystals),
      )
    }

    await this.reward(session, adventure, actor)
  }

  /**
   * Gives an actor's experience once
   * @param session The player's session
   * @param adventure The adventure
   * @param actor The actor
   */
  private async reward(
    session: Session,
    adventure: Adventure,
    actor: AdventureActor,
  ): Promise<void> {
    const gameId = session.player?.gameId ?? -1
    if (actor.template.xp <= 0 || actor.claimed.has(gameId)) return

    actor.claimed.add(gameId)
    await this.runner.giveXp(
      session,
      adventure,
      actor.template.xp,
      actor.actorId,
    )
  }
}

/**
 * Keeps or turns down a treasure
 * @class
 */
@Handler(QuestTreasureIncoming)
export class QuestTreasureHandler extends PacketHandler<QuestTreasureIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Gives the prize if kept
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestTreasureIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const adventure = this.runner.playing(player.gameId)
    const prize = adventure?.answer(player.gameId, packet.actorId) ?? null
    if (!adventure || !prize || packet.keep !== 1) return

    const membersOnly = adventure.actor(packet.actorId)?.template.membersOnly
    if (membersOnly && !player.member) {
      context.log.info({ actorId: packet.actorId }, 'member treasure refused')
      return
    }

    await this.runner.award(session, adventure, prize)
  }
}
