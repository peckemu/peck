import { ContentExport, type Row } from '#content/exports/export'
import { type PackSet } from '#content/pack'
import { type Strings } from '#content/strings'

/**
 * Exports the den item pack
 * @class
 */
export class DenItemsExport extends ContentExport {
  /**
   * The file name
   */
  public readonly file = 'den-items'

  /**
   * The pack ids it reads
   */
  public readonly packs = [1030]

  /**
   * Reads the den items
   * @param packs The def packs
   * @param strings The English strings
   * @returns The den items
   */
  public rows(packs: PackSet, strings: Strings): Row[] {
    const pack = packs.get(1030)

    return pack.definitions().map((definition) => ({
      defId: definition.int('id'),
      name: strings.name(definition.int('nameStrId')),
      abbrName: definition.text('abbrName'),
      nameStrId: definition.int('nameStrId'),
      specialType: definition.int('specialType'),
      cost: definition.int('cost'),
      currencyType: definition.int('currencyType'),
      combinedCost: definition.text('combinedCost'),
      recycleValue: definition.int('recycleValue'),
      membersOnly: definition.int('membersOnly') !== 0,
      status: definition.int('itemStatus'),
      sortCat: definition.int('sortCat'),
      typeCat: definition.int('typeCat'),
      enviroType: definition.int('enviroType'),
      layer: definition.int('layer'),
      flag: definition.int('flag'),
      gameDefId: definition.int('gameDefId'),
      listId: definition.int('parentArrayId'),
      mannequinAvatarDefId: definition.int('mannequinAvatarDefId'),
      mannequinCatId: definition.int('mannequinCatId'),
      parentArrayId: definition.int('parentArrayId'),
      promoType: definition.int('promoType'),
      scalePercent: definition.int('scalePercent'),
      ecoPower: definition.int('ecoPower'),
      availableFrom: definition.time('availabilityStartTime'),
      availableUntil: definition.time('availabilityEndTime'),
    }))
  }
}
