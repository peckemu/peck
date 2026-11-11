import { type EntityWrite } from 'uql-orm'

import { WorldItemDefinition } from '#database/entities/definitions/world'
import { DefinitionSeed, type Timed, timed } from '#database/seeds/definition'

/**
 * Seeds the world items
 * @class
 */
export class WorldItemsSeed extends DefinitionSeed<WorldItemDefinition> {
  /**
   * The seed name
   */
  public readonly name = 'world-items'

  /**
   * Whether the file can be missing
   */
  protected override readonly optional = true

  /**
   * The entity it fills
   */
  protected readonly entity = WorldItemDefinition

  /**
   * Turns the rows into world items
   * @param rows The rows
   * @returns The world items
   */
  protected definitions(
    rows: unknown[],
  ): readonly EntityWrite<WorldItemDefinition>[] {
    return (rows as Timed<WorldItemDefinition>[]).map((entry) => timed(entry))
  }
}
