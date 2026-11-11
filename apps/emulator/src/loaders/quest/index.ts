import { inject, injectable } from '@needle-di/core'
import {
  type QuestDefinition,
  QuestRepository,
  type StoredActor,
  type StoredPrize,
} from '@peck/database'
import {
  type QuestActorTemplate,
  QuestCatalogue,
  type QuestPrize,
  type QuestTemplate,
  RoomManager,
} from '@peck/game'
import { type Logger } from '@peck/logger'
import { QuestPrizeKind } from '@peck/shared'

import { Loader } from '#emulator/loaders/loader'
import { LoggerToken } from '#emulator/tokens'

/**
 * The prize kinds a player can win
 */
const WINNABLE: ReadonlySet<number> = new Set<number>([
  QuestPrizeKind.DenItem,
  QuestPrizeKind.Clothing,
  QuestPrizeKind.Gems,
  QuestPrizeKind.Crystals,
])

/**
 * Loads the adventures
 * @class
 */
@injectable()
export class QuestLoader extends Loader {
  /**
   * Every adventure
   */
  private readonly quests = inject<QuestCatalogue>(QuestCatalogue)

  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * Reads the adventures
   */
  private readonly repository = inject<QuestRepository>(QuestRepository)

  /**
   * The emulator's logger
   */
  private readonly logger = inject<Logger>(LoggerToken)

  /**
   * Registers every adventure
   */
  public async load(): Promise<void> {
    const definitions = await this.repository.definitions()

    for (const definition of definitions) {
      this.quests.register(QuestLoader.template(definition))
    }

    const roomless = definitions.filter(
      ({ roomDefId }) => !this.rooms.byDefId(roomDefId),
    )
    this.logger.info(
      { quests: definitions.length, roomless: roomless.length },
      'adventures loaded',
    )
  }

  /**
   * Reads an adventure
   * @param definition The stored adventure
   * @returns The adventure
   */
  public static template(definition: QuestDefinition): QuestTemplate {
    return {
      defId: definition.defId,
      titleStrId: definition.titleStrId,
      roomDefId: definition.roomDefId,
      avatarLimit: definition.avatarLimit,
      avatarMin: definition.avatarMin,
      levelMin: definition.levelMin,
      hardLevelMin: definition.hardLevelMin,
      membersOnly: definition.membersOnly,
      avatarType: definition.avatarType,
      actors: definition.actors.map((actor) => QuestLoader.actor(actor)),
      gifts: definition.gifts.flatMap((gift) => {
        const prize = QuestLoader.prize(gift)
        return prize ? [prize] : []
      }),
      giftActor: definition.giftActor,
      popupType: definition.popupType,
      crystalGoal: definition.crystalGoal,
      music: definition.music,
      soundPacks: definition.soundPacks,
    }
  }

  /**
   * Reads an actor
   * @param actor The stored actor
   * @returns The actor
   */
  private static actor(actor: StoredActor): QuestActorTemplate {
    return {
      actorId: actor.actorId,
      type: actor.type,
      defId: actor.defId ?? 0,
      defName: actor.defName ?? '',
      state: actor.state ?? 0,
      visible: actor.visible ?? true,
      requireClick: actor.requireClick ?? false,
      pathName: actor.pathName ?? '',
      swfState: actor.swfState ?? '',
      prize: actor.prize ? QuestLoader.prize(actor.prize) : null,
      xp: actor.xp ?? 0,
      health: actor.health ?? 0,
      membersOnly: actor.membersOnly ?? false,
    }
  }

  /**
   * Reads a prize
   * @param prize The stored prize
   * @returns The prize, or null
   */
  private static prize(prize: StoredPrize): QuestPrize | null {
    if (!WINNABLE.has(prize.kind) || prize.value <= 0) return null

    return {
      kind: prize.kind as QuestPrizeKind,
      value: prize.value,
      color: (prize.color ?? 0) >>> 0,
    }
  }
}
