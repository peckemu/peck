import { inject } from '@needle-di/core'
import { HEAL, PHANTOM_DAMAGE, PLAYER_DAMAGE } from '@peck/game'
import {
  QuestAttackIncoming,
  QuestAttackOutgoing,
  QuestBeamZapIncoming,
  QuestBeamZapOutgoing,
  QuestDestructibleIncoming,
  QuestHealIncoming,
  QuestHitIncoming,
  QuestPhantomZapIncoming,
  QuestPhantomZapOutgoing,
  QuestRespawnIncoming,
  QuestRespawnOutgoing,
  QuestRespawnedOutgoing,
  QuestSwipeIncoming,
  QuestSwipeOutgoing,
  QuestThrowIncoming,
  QuestThrowOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '../../../dispatch/context/index.ts'
import { QuestRunner } from '../runner/index.ts'

/**
 * The weapon of a runaway phantom caught
 */
const CAUGHT = -1

/**
 * More than any actor's health
 */
const ALL_HEALTH = 1_000_000

/**
 * Hurts the player and tells everyone
 * @param runner Runs adventures
 * @param context The packet context
 * @param damage The damage
 */
const hurt = async (
  runner: QuestRunner,
  context: HandlerContext,
  damage: number,
): Promise<void> => {
  const { player } = context

  const adventure = runner.playing(player.gameId)
  const adventurer = adventure?.hurt(player.gameId, damage) ?? null
  if (!adventure || !adventurer) return

  await runner.tellHealth(adventure, adventurer, -damage)
}

/**
 * Says something was hit
 * @class
 */
@Handler(QuestHitIncoming)
export class QuestHitHandler extends PacketHandler<QuestHitIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Hurts the actor or the player
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestHitIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    if (packet.actorId === '' || packet.playerHit === 1) {
      return hurt(this.runner, context, PHANTOM_DAMAGE)
    }

    const adventure = this.runner.playing(player.gameId)
    if (!adventure) return

    const damage = packet.weaponDefId === CAUGHT ? ALL_HEALTH : PLAYER_DAMAGE
    await this.runner.strike(adventure, packet.actorId, damage, session)
  }
}

/**
 * Says a phantom attacks a player
 * @class
 */
@Handler(QuestAttackIncoming)
export class QuestAttackHandler extends PacketHandler<QuestAttackIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Tells the others about the attack
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestAttackIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player } = context

    const adventure = this.runner.playing(player.gameId)
    if (!adventure?.actor(packet.actorId)) return

    const attack = QuestAttackOutgoing.of(
      adventure.room?.id ?? packet.room,
      packet.actorId,
      packet.userId,
      packet.weaponDefId,
      packet.color,
    )
    await this.runner.tell(adventure, attack, player.gameId)
  }
}

/**
 * Says a beam caught the player
 * @class
 */
@Handler(QuestBeamZapIncoming)
export class QuestBeamZapHandler extends PacketHandler<QuestBeamZapIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Plays the zap and hurts the player
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestBeamZapIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player } = context

    const adventure = this.runner.playing(player.gameId)
    if (!adventure?.actor(packet.actorId)) return

    await this.runner.tell(
      adventure,
      QuestBeamZapOutgoing.of(
        adventure.room?.id ?? packet.room,
        packet.actorId,
        player.id,
      ),
    )
    await hurt(this.runner, context, PHANTOM_DAMAGE)
  }
}

/**
 * Says a phantom caught the player
 * @class
 */
@Handler(QuestPhantomZapIncoming)
export class QuestPhantomZapHandler extends PacketHandler<QuestPhantomZapIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Plays the zap and hurts the player
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestPhantomZapIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player } = context

    const adventure = this.runner.playing(player.gameId)
    if (!adventure) return

    await this.runner.tell(
      adventure,
      QuestPhantomZapOutgoing.of(
        adventure.room?.id ?? packet.room,
        packet.actorId,
        player.id,
      ),
    )
    await hurt(this.runner, context, PHANTOM_DAMAGE)
  }
}

/**
 * Says a phantom hit a destructible
 * @class
 */
@Handler(QuestDestructibleIncoming)
export class QuestDestructibleHandler extends PacketHandler<QuestDestructibleIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Hurts the destructible
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestDestructibleIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const adventure = this.runner.playing(context.player.gameId)
    if (!adventure?.actor(packet.phantomActorId)) return

    await this.runner.strike(
      adventure,
      packet.destructibleActorId,
      PHANTOM_DAMAGE,
      null,
    )
  }
}

/**
 * Says a heal landed
 * @class
 */
@Handler(QuestHealIncoming)
export class QuestHealHandler extends PacketHandler<QuestHealIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Heals the player
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestHealIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const adventure = this.runner.playing(context.player.gameId)
    const healed = adventure?.byUser(packet.userId) ?? null
    if (!adventure || !healed) return

    const given = adventure.heal(healed.gameId, HEAL)
    if (given > 0) await this.runner.tellHealth(adventure, healed, given)
  }
}

/**
 * Throws a weapon
 * @class
 */
@Handler(QuestThrowIncoming)
export class QuestThrowHandler extends PacketHandler<QuestThrowIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Shows the others the throw
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestThrowIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player } = context

    const adventure = this.runner.playing(player.gameId)
    if (!adventure) return

    const thrown = QuestThrowOutgoing.of(adventure.room?.id ?? packet.room, {
      weaponDefId: packet.weaponDefId,
      x: packet.x,
      y: packet.y,
      actorId: '',
      userId: player.id,
      color: packet.color,
    })
    await this.runner.tell(adventure, thrown, player.gameId)
  }
}

/**
 * Swings a weapon
 * @class
 */
@Handler(QuestSwipeIncoming)
export class QuestSwipeHandler extends PacketHandler<QuestSwipeIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Shows the others the swing
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestSwipeIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player } = context

    const adventure = this.runner.playing(player.gameId)
    if (!adventure) return

    const swung = QuestSwipeOutgoing.of(adventure.room?.id ?? packet.room, {
      weaponDefId: packet.weaponDefId,
      x: packet.x,
      y: packet.y,
      actorId: '',
      userId: player.id,
      color: packet.color,
    })
    await this.runner.tell(adventure, swung, player.gameId)
  }
}

/**
 * Asks to come back
 * @class
 */
@Handler(QuestRespawnIncoming)
export class QuestRespawnHandler extends PacketHandler<QuestRespawnIncoming> {
  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Brings the player back
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestRespawnIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const adventure = this.runner.playing(player.gameId)
    const revived = adventure?.revive(player.gameId) ?? null
    if (!adventure || !revived) return

    const roomId = adventure.room?.id ?? packet.room
    player.position = { x: packet.x, y: packet.y }
    await session.send<QuestRespawnOutgoing>(QuestRespawnOutgoing.of(roomId))
    await this.runner.tell(
      adventure,
      QuestRespawnedOutgoing.of(
        roomId,
        {
          userId: player.id,
          change: revived.health,
          health: revived.health,
          maxHealth: revived.health,
        },
        packet.x,
        packet.y,
      ),
    )
  }
}
