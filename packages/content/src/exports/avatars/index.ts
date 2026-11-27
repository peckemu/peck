import { ContentExport, type Row } from '../export/index.ts'
import { type PackSet } from '../../pack/index.ts'
import { type Strings } from '../../strings/index.ts'

/**
 * Exports the avatar pack
 * @class
 */
export class AvatarsExport extends ContentExport {
  /**
   * The file name
   */
  public readonly file = 'avatars'

  /**
   * The pack ids it reads
   */
  public readonly packs = [1003]

  /**
   * Reads the animals
   * @param packs The def packs
   * @param strings The English strings
   * @returns The animals
   */
  public rows(packs: PackSet, strings: Strings): Row[] {
    const pack = packs.get(1003)

    return pack.definitions().map((definition) => ({
      defId: definition.int('id'),
      name: strings.name(definition.int('titleStrRef')),
      titleStrId: definition.int('titleStrRef'),
      colors: [
        definition.uint('colorLayer1'),
        definition.uint('colorLayer2'),
        definition.uint('colorLayer3'),
      ],
      eyesDefId: definition.int('baseEyesId'),
      patternDefId: definition.int('basePatternId'),
      membersOnly: definition.flag('membersOnly'),
      enviroTypeFlags: definition.int('enviroTypeFlags'),
      cost: definition.int('cost'),
      availability: definition.int('availability'),
      status: definition.int('status'),
    }))
  }
}
