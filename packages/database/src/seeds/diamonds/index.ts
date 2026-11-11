import { type EntityWrite } from 'uql-orm'

import { DiamondDefinition } from '#database/entities/definitions/diamond'
import { DefinitionSeed, type Timed, timed } from '#database/seeds/definition'

/**
 * Seeds the diamond shop
 * @class
 */
export class DiamondsSeed extends DefinitionSeed<DiamondDefinition> {
  /**
   * The seed name
   */
  public readonly name = 'diamonds'

  /**
   * The definitions table
   */
  protected readonly entity = DiamondDefinition

  /**
   * Reads the diamond shop entries
   * @param rows The exported rows
   * @returns The entries
   */
  protected definitions(
    rows: unknown[],
  ): readonly EntityWrite<DiamondDefinition>[] {
    return (rows as Timed<DiamondDefinition>[]).map((entry) => timed(entry))
  }
}
