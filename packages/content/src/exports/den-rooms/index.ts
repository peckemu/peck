import { ContentExport, type Row } from '#content/exports/export'
import { type PackSet } from '#content/pack'
import { type Strings } from '#content/strings'

/**
 * Exports the den room pack
 * @class
 */
export class DenRoomsExport extends ContentExport {
  /**
   * The file name
   */
  public readonly file = 'den-rooms'

  /**
   * The pack ids it reads
   */
  public readonly packs = [1040]

  /**
   * Reads the dens
   * @param packs The def packs
   * @param strings The English strings
   * @returns The dens
   */
  public rows(packs: PackSet, strings: Strings): Row[] {
    const pack = packs.get(1040)

    return pack
      .definitions()
      .filter((definition) => definition.int('roomDefId') > 0)
      .map((definition) => ({
        defId: definition.int('id'),
        name: strings.name(definition.int('titleStrRef')),
        titleStrId: definition.int('titleStrRef'),
        roomDefId: definition.int('roomDefId'),
        enviroType: definition.int('enviroType'),
        cost: definition.int('cost'),
        mediaRef: definition.int('mediaRef'),
        iconMediaRef: definition.int('iconMediaRef'),
        status: definition.int('storeStatus'),
        membersOnly: definition.flag('membersOnly'),
        availableFrom: definition.time('availabilityStartTime'),
        availableUntil: definition.time('availabilityEndTime'),
      }))
  }
}
