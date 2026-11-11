import { type EntityWrite } from 'uql-orm'

import { AchievementDefinition } from '#database/entities/definitions/achievement'
import { DefinitionSeed } from '#database/seeds/definition'

/**
 * Seeds the achievements
 * @class
 */
export class AchievementsSeed extends DefinitionSeed<AchievementDefinition> {
  /**
   * The seed name
   */
  public readonly name = 'achievements'

  /**
   * The definitions table
   */
  protected readonly entity = AchievementDefinition

  /**
   * Reads the achievements
   * @param rows The exported rows
   * @returns The achievements
   */
  protected definitions(
    rows: unknown[],
  ): readonly EntityWrite<AchievementDefinition>[] {
    return rows as EntityWrite<AchievementDefinition>[]
  }
}
