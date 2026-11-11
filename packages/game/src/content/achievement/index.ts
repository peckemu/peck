import { BIT_FIELD_USER_VARS, UserVar } from '@peck/shared'

import { Catalogue } from '#game/catalogue'

/**
 * The user variables no achievement counts
 */
const UNCOUNTED: ReadonlySet<number> = new Set<number>([
  ...BIT_FIELD_USER_VARS.keys(),
  UserVar.AvatarViewableFlag,
  UserVar.CustomAvatarViewableFlag,
  UserVar.DailyGemBonus,
])

/**
 * An achievement
 */
export type AchievementTemplate = {
  /**
   * The achievement's id
   */
  readonly defId: number

  /**
   * Its name
   */
  readonly name?: string | null

  /**
   * Its Journey Book page
   */
  readonly type: number

  /**
   * The user variable it counts
   */
  readonly userVarRef: number

  /**
   * The count it needs
   */
  readonly triggerAmount: number
}

/**
 * Every achievement
 * @class
 */
export class AchievementCatalogue extends Catalogue<AchievementTemplate> {
  /**
   * Finds the achievements a value earns
   * @param varId The variable's id
   * @param value Its value
   * @param held The achievements the player has
   * @returns The new achievement ids
   */
  public reached(
    varId: number,
    value: number,
    held: ReadonlySet<number>,
  ): number[] {
    if (UNCOUNTED.has(varId)) return []

    return [...this]
      .filter(
        (achievement) =>
          achievement.userVarRef === varId &&
          achievement.triggerAmount > 0 &&
          value >= achievement.triggerAmount &&
          !held.has(achievement.defId),
      )
      .map(({ defId }) => defId)
  }
}
