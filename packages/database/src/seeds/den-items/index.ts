import { type EntityWrite } from 'uql-orm'

import { DenItemDefinition } from '#database/entities/definitions/den-item'
import { DefinitionSeed, type Timed, timed } from '#database/seeds/definition'

/**
 * Seeds the den items
 * @class
 */
export class DenItemsSeed extends DefinitionSeed<DenItemDefinition> {
  /**
   * The seed name
   */
  public readonly name = 'den-items'

  /**
   * The definitions table
   */
  protected readonly entity = DenItemDefinition

  /**
   * Reads the den items
   * @param rows The exported rows
   * @returns The den items
   */
  protected definitions(
    rows: unknown[],
  ): readonly EntityWrite<DenItemDefinition>[] {
    return (rows as Timed<DenItemDefinition>[]).map((entry) => timed(entry))
  }
}
