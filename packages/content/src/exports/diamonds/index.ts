import { ContentExport, type Row } from '../export/index.ts'
import { type PackSet } from '../../pack/index.ts'

/**
 * Exports the diamond shop pack
 * @class
 */
export class DiamondsExport extends ContentExport {
  /**
   * The file name
   */
  public readonly file = 'diamonds'

  /**
   * The pack ids it reads
   */
  public readonly packs = [1054]

  /**
   * Reads the diamond shop entries
   * @param packs The def packs
   * @returns The entries
   */
  public rows(packs: PackSet): Row[] {
    return packs
      .get(1054)
      .definitions()
      .map((definition) => ({
        defId: definition.int('id'),
        type: definition.int('type'),
        refId: definition.int('refId'),
        cost: definition.int('cost'),
        status: definition.int('status'),
        availableFrom: definition.time('availabilityStartTime'),
        availableUntil: definition.time('availabilityEndTime'),
      }))
  }
}
