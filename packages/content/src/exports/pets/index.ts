import { ContentExport, type Row } from '#content/exports/export'
import { type PackSet } from '#content/pack'
import { type Strings } from '#content/strings'

/**
 * Exports the pet pack
 * @class
 */
export class PetsExport extends ContentExport {
  /**
   * The file name
   */
  public readonly file = 'pets'

  /**
   * The pack ids it reads
   */
  public readonly packs = [1046]

  /**
   * Reads the pets
   * @param packs The def packs
   * @param strings The English strings
   * @returns The pets
   */
  public rows(packs: PackSet, strings: Strings): Row[] {
    const pack = packs.get(1046)

    return pack.definitions().map((definition) => ({
      defId: definition.int('id'),
      name: strings.name(definition.int('titleStrId')),
      titleStrId: definition.int('titleStrId'),
      mediaRefId: definition.int('mediaRefId'),
      type: definition.int('type'),
      membersOnly: definition.flag('isMember'),
      cost: definition.int('cost'),
      status: definition.int('status'),
      toyListId: definition.int('toyListId'),
      foodListId: definition.int('foodListId'),
      reward: definition.flag('isReward'),
      egg: definition.flag('isEgg'),
      availableFrom: definition.time('availabilityStartTime'),
      availableUntil: definition.time('availabilityEndTime'),
    }))
  }
}
