import { type QuestPrizeKind } from '@peck/shared'

import { Catalogue } from '#game/catalogue'

/**
 * Who an adventure is for
 */
export const QuestAvatarType = {
  /**
   * Any animal
   */
  Any: 0,

  /**
   * Land animals
   */
  Land: 1,

  /**
   * Ocean animals
   */
  Ocean: 2,
} as const

export type QuestAvatarType =
  (typeof QuestAvatarType)[keyof typeof QuestAvatarType]

/**
 * An adventure prize
 */
export type QuestPrize = {
  /**
   * What it is
   */
  readonly kind: QuestPrizeKind

  /**
   * The item or the amount
   */
  readonly value: number

  /**
   * The clothing colour
   */
  readonly color: number
}

/**
 * An actor an adventure starts with
 */
export type QuestActorTemplate = {
  /**
   * Its id
   */
  readonly actorId: string

  /**
   * Its type
   */
  readonly type: number

  /**
   * Its definition
   */
  readonly defId: number

  /**
   * Its definition's name
   */
  readonly defName: string

  /**
   * Its state
   */
  readonly state: number

  /**
   * Whether it shows
   */
  readonly visible: boolean

  /**
   * Whether it needs a click
   */
  readonly requireClick: boolean

  /**
   * The path it walks
   */
  readonly pathName: string

  /**
   * Its animation state
   */
  readonly swfState: string

  /**
   * What it gives, or null
   */
  readonly prize: QuestPrize | null

  /**
   * The experience it gives
   */
  readonly xp: number

  /**
   * Its health, or 0
   */
  readonly health: number

  /**
   * Whether its prize is for members
   */
  readonly membersOnly: boolean
}

/**
 * An adventure
 */
export type QuestTemplate = {
  /**
   * The adventure's script id
   */
  readonly defId: number

  /**
   * Its name string id
   */
  readonly titleStrId: number

  /**
   * The room it starts in
   */
  readonly roomDefId: number

  /**
   * The most players
   */
  readonly avatarLimit: number

  /**
   * The fewest players
   */
  readonly avatarMin: number

  /**
   * The lowest level
   */
  readonly levelMin: number

  /**
   * The lowest level for hard mode
   */
  readonly hardLevelMin: number

  /**
   * Whether it is for members
   */
  readonly membersOnly: boolean

  /**
   * Who it is for
   */
  readonly avatarType: number

  /**
   * The actors it starts with
   */
  readonly actors: readonly QuestActorTemplate[]

  /**
   * The gifts at the end
   */
  readonly gifts: readonly QuestPrize[]

  /**
   * The actor that opens the gifts, or empty
   */
  readonly giftActor: string

  /**
   * The gift screen's look
   */
  readonly popupType: number

  /**
   * The crystals needed for the gifts
   */
  readonly crystalGoal: number

  /**
   * The music, or empty
   */
  readonly music: string

  /**
   * The sound packs it loads
   */
  readonly soundPacks: readonly number[]
}

/**
 * Every adventure
 * @class
 */
export class QuestCatalogue extends Catalogue<QuestTemplate> {}
