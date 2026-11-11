import { type EntityWrite } from 'uql-orm'

import { DenRoomDefinition } from '#database/entities/definitions/den-room'
import { DefinitionSeed, type Timed, timed } from '#database/seeds/definition'

/**
 * Seeds the dens
 * @class
 */
export class DenRoomsSeed extends DefinitionSeed<DenRoomDefinition> {
  /**
   * The seed name
   */
  public readonly name = 'den-rooms'

  /**
   * The definitions table
   */
  protected readonly entity = DenRoomDefinition

  /**
   * Reads the dens
   * @param rows The exported rows
   * @returns The dens
   */
  protected definitions(
    rows: unknown[],
  ): readonly EntityWrite<DenRoomDefinition>[] {
    return (rows as Timed<DenRoomDefinition>[]).map((entry) => timed(entry))
  }
}
