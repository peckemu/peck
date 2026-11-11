import { ContentExport, type Row } from '#content/exports/export'
import { type PackSet } from '#content/pack'
import { type Strings } from '#content/strings'

/**
 * Exports the achievement pack
 * @class
 */
export class AchievementsExport extends ContentExport {
  /**
   * The file name
   */
  public readonly file = 'achievements'

  /**
   * The pack ids it reads
   */
  public readonly packs = [1042]

  /**
   * Reads the achievements
   * @param packs The def packs
   * @param strings The English strings
   * @returns The achievements
   */
  public rows(packs: PackSet, strings: Strings): Row[] {
    return packs
      .get(1042)
      .definitions()
      .filter((definition) => definition.int('id') > 0)
      .map((definition) => ({
        defId: definition.int('id'),
        name: strings.name(definition.int('titleStrRef')),
        titleStrRef: definition.int('titleStrRef'),
        type: definition.int('type'),
        userVarRef: definition.int('userVarRef'),
        triggerAmount: definition.int('triggerAmount'),
      }))
  }
}
