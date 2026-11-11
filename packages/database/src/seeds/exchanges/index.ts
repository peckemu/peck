import { type EntityWrite } from 'uql-orm'

import { ExchangeDefinition } from '#database/entities/definitions/exchange'
import { DefinitionSeed, type Timed, timed } from '#database/seeds/definition'

/**
 * Seeds the currency exchanges
 * @class
 */
export class ExchangesSeed extends DefinitionSeed<ExchangeDefinition> {
  /**
   * The seed name
   */
  public readonly name = 'exchanges'

  /**
   * Whether the content file can be missing
   */
  protected override readonly optional = true

  /**
   * The definitions table
   */
  protected readonly entity = ExchangeDefinition

  /**
   * Reads the currency exchanges
   * @param rows The exported rows
   * @returns The exchanges
   */
  protected definitions(
    rows: unknown[],
  ): readonly EntityWrite<ExchangeDefinition>[] {
    return (rows as Timed<ExchangeDefinition>[]).map((entry) => timed(entry))
  }
}
