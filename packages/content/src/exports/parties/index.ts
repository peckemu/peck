import { ContentExport, type Row } from '../export/index.ts'
import { type PackSet } from '../../pack/index.ts'
import { type Strings } from '../../strings/index.ts'

/**
 * Exports the party pack
 * @class
 */
export class PartiesExport extends ContentExport {
  /**
   * The file name
   */
  public readonly file = 'parties'

  /**
   * The pack ids it reads
   */
  public readonly packs = [1047]

  /**
   * Reads the parties
   * @param packs The def packs
   * @param strings The English strings
   * @returns The parties
   */
  public rows(packs: PackSet, strings: Strings): Row[] {
    return packs
      .get(1047)
      .definitions()
      .filter((definition) => definition.int('id') > 0)
      .map((definition) => ({
        defId: definition.int('id'),
        name: strings.name(definition.int('titleStrId')),
        titleStrId: definition.int('titleStrId'),
        mediaRefId: definition.int('mediaRefId'),
        iconMediaRefId: definition.int('iconMediaRefId'),
        restrictions: definition.int('restrictions'),
        avatarDefFlags: definition.text('avatarDefFlags') || '0',
        petDefScalableFlags: definition.uints('petDefScalableFlags'),
        isGame: definition.flag('isGame'),
        isCustom: definition.flag('isCustom'),
        roomDefId: definition.int('roomDefId'),
      }))
  }
}
