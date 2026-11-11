import { type EntityWrite } from 'uql-orm'

import { GenericListDefinition } from '#database/entities/definitions/list'
import { DefinitionSeed } from '#database/seeds/definition'

/**
 * Seeds the generic lists
 * @class
 */
export class ListsSeed extends DefinitionSeed<GenericListDefinition> {
  /**
   * The seed name
   */
  public readonly name = 'lists'

  /**
   * The definitions table
   */
  protected readonly entity = GenericListDefinition

  /**
   * Reads the lists
   * @param rows The exported rows
   * @returns The lists
   */
  protected definitions(
    rows: unknown[],
  ): readonly EntityWrite<GenericListDefinition>[] {
    return rows as EntityWrite<GenericListDefinition>[]
  }
}
