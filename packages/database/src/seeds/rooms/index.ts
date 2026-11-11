import { type EntityWrite } from 'uql-orm'

import { RoomDefinition } from '#database/entities/definitions/room'
import { DefinitionSeed } from '#database/seeds/definition'

/**
 * Seeds the rooms
 * @class
 */
export class RoomsSeed extends DefinitionSeed<RoomDefinition> {
  /**
   * The seed name
   */
  public readonly name = 'rooms'

  /**
   * The definitions table
   */
  protected readonly entity = RoomDefinition

  /**
   * Reads the rooms
   * @param rows The exported rows
   * @returns The rooms
   */
  protected definitions(
    rows: unknown[],
  ): readonly EntityWrite<RoomDefinition>[] {
    return rows as EntityWrite<RoomDefinition>[]
  }
}
