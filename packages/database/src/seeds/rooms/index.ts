import { type EntityWrite } from 'uql-orm'

import { RoomDefinition } from '../../entities/definitions/room/index.ts'
import { DefinitionSeed } from '../definition/index.ts'

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
