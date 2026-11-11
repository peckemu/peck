/**
 * The highest adventure level
 */
const MOST_LEVEL = 100

/**
 * The experience each level adds to the next
 */
const STEP = 50

/**
 * Where a player stands in adventure levels
 */
export type QuestStanding = {
  /**
   * The level
   */
  readonly level: number

  /**
   * The way to the next level, from 0 to 100
   */
  readonly progress: number
}

/**
 * Adventure levels
 * @class
 */
export class QuestLevels {
  /**
   * The experience a level needs
   * @param level The level
   * @returns The experience
   */
  public static xpFor(level: number): number {
    return (STEP * level * (level - 1)) / 2
  }

  /**
   * Works out a player's level
   * @param xp The experience
   * @returns The level and the way to the next
   */
  public static standing(xp: number): QuestStanding {
    let level = 1
    while (level < MOST_LEVEL && QuestLevels.xpFor(level + 1) <= xp) level++

    if (level === MOST_LEVEL) return { level, progress: 100 }

    const from = QuestLevels.xpFor(level)
    const to = QuestLevels.xpFor(level + 1)
    const progress = Math.floor(((xp - from) * 100) / (to - from))

    return { level, progress }
  }
}
