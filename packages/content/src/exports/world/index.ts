import { ContentExport, type Row } from '../export/index.ts'
import { type PackSet } from '../../pack/index.ts'

/**
 * The world items pack
 */
const PACK = 1064

/**
 * Exports the world items pack
 * @class
 */
export class WorldItemsExport extends ContentExport {
  /**
   * The file name
   */
  public readonly file = 'world-items'

  /**
   * The pack ids it reads
   */
  public readonly packs = [PACK]

  /**
   * Reads the world items
   * @param packs The def packs
   * @returns The world items
   */
  public rows(packs: PackSet): Row[] {
    return packs
      .get(PACK)
      .definitions()
      .map((definition) => ({
        defId: definition.int('id'),
        giftType: definition.int('giftType'),
        giftRefId: definition.int('giftRefId'),
        amount: definition.int('amount'),
        position: definition.int('position'),
        userVarRefId: definition.int('userVarRefId'),
        uvIndex: definition.int('uvIndex'),
        availableFrom: definition.time('availabilityStartTime'),
        availableUntil: definition.time('availabilityEndTime'),
      }))
  }
}
