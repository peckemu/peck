import { ContentExport, type Row } from '#content/exports/export'
import { type PackSet } from '#content/pack'

/**
 * A mixed currency type
 */
const COMBINED = 100

/**
 * Exports the currency exchange pack
 * @class
 */
export class ExchangesExport extends ContentExport {
  /**
   * The file name
   */
  public readonly file = 'exchanges'

  /**
   * The pack ids it reads
   */
  public readonly packs = [1051]

  /**
   * Reads the currency exchanges
   * @param packs The def packs
   * @returns The exchanges
   */
  public rows(packs: PackSet): Row[] {
    return packs
      .get(1051)
      .definitions()
      .map((definition) => {
        const currencyType = definition.int('costType')
        const combined = currencyType === COMBINED

        return {
          defId: definition.int('id'),
          cost: combined ? 0 : definition.int('cost'),
          currencyType,
          combinedCost: combined ? definition.text('cost') : '',
          result: definition.int('result'),
          resultType: definition.int('resultType'),
          availableFrom: definition.time('availabilityStartTime'),
          availableUntil: definition.time('availabilityEndTime'),
        }
      })
  }
}
