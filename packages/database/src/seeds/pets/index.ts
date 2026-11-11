import { type EntityWrite } from 'uql-orm'

import { PetDefinition } from '#database/entities/definitions/pet'
import { DefinitionSeed, type Timed, timed } from '#database/seeds/definition'

/**
 * Seeds the pets
 * @class
 */
export class PetsSeed extends DefinitionSeed<PetDefinition> {
  /**
   * The seed name
   */
  public readonly name = 'pets'

  /**
   * The definitions table
   */
  protected readonly entity = PetDefinition

  /**
   * Reads the pets
   * @param rows The exported rows
   * @returns The pets
   */
  protected definitions(
    rows: unknown[],
  ): readonly EntityWrite<PetDefinition>[] {
    return (rows as Timed<PetDefinition>[]).map((entry) => timed(entry))
  }
}
