import { type EntityWrite } from 'uql-orm'

import { AvatarDefinition } from '#database/entities/definitions/avatar'
import { DefinitionSeed } from '#database/seeds/definition'

/**
 * Seeds the animals
 * @class
 */
export class AvatarsSeed extends DefinitionSeed<AvatarDefinition> {
  /**
   * The seed name
   */
  public readonly name = 'avatars'

  /**
   * The definitions table
   */
  protected readonly entity = AvatarDefinition

  /**
   * Reads the animals
   * @param rows The exported rows
   * @returns The animals
   */
  protected definitions(
    rows: unknown[],
  ): readonly EntityWrite<AvatarDefinition>[] {
    return rows as EntityWrite<AvatarDefinition>[]
  }
}
