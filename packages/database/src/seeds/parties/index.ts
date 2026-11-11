import { type EntityWrite } from 'uql-orm'

import { PartyDefinition } from '#database/entities/definitions/party'
import { DefinitionSeed } from '#database/seeds/definition'

/**
 * Seeds the parties
 * @class
 */
export class PartiesSeed extends DefinitionSeed<PartyDefinition> {
  /**
   * The seed name
   */
  public readonly name = 'parties'

  /**
   * The definitions table
   */
  protected readonly entity = PartyDefinition

  /**
   * Reads the parties
   * @param rows The exported rows
   * @returns The parties
   */
  protected definitions(
    rows: unknown[],
  ): readonly EntityWrite<PartyDefinition>[] {
    return rows as EntityWrite<PartyDefinition>[]
  }
}
