import { type EntityWrite } from 'uql-orm'

import { ItemDefinition } from '../../entities/definitions/item/index.ts'
import { DefinitionSeed, type Timed, timed } from '../definition/index.ts'

/**
 * Seeds the clothing items
 * @class
 */
export class ItemsSeed extends DefinitionSeed<ItemDefinition> {
  /**
   * The seed name
   */
  public readonly name = 'items'

  /**
   * The definitions table
   */
  protected readonly entity = ItemDefinition

  /**
   * Reads the items
   * @param rows The exported rows
   * @returns The items
   */
  protected definitions(
    rows: unknown[],
  ): readonly EntityWrite<ItemDefinition>[] {
    return (rows as Timed<ItemDefinition>[]).map((entry) => timed(entry))
  }
}
