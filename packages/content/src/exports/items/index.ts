import { ContentExport, type Row } from '#content/exports/export'
import { type PackSet } from '#content/pack'
import { type Strings } from '#content/strings'

/**
 * Exports the clothing pack
 * @class
 */
export class ItemsExport extends ContentExport {
  /**
   * The file name
   */
  public readonly file = 'items'

  /**
   * The pack ids it reads
   */
  public readonly packs = [1000]

  /**
   * Reads the clothing items
   * @param packs The def packs
   * @param strings The English strings
   * @returns The items
   */
  public rows(packs: PackSet, strings: Strings): Row[] {
    const pack = packs.get(1000)

    return pack.definitions().map((definition) => {
      const flags = definition.number('avatarUseFlags')
      return {
        defId: definition.int('id'),
        name: strings.name(definition.int('titleStrId')),
        accId: definition.int('layerDefId'),
        layerId: definition.int('layerId'),
        titleStrId: definition.int('titleStrId'),
        type: definition.int('type'),
        cost: definition.int('value'),
        currencyType: definition.int('currencyType'),
        combinedCost: definition.text('combinedCost'),
        recycleValue: definition.int('recycleValue'),
        status: definition.int('itemStatus'),
        giftable: definition.flag('isGiftable'),
        membersOnly: definition.flag('membersOnly'),
        enviroType: definition.int('enviroType'),
        avatarUseFlags: Number.isFinite(flags) ? flags : 0,
        colors: definition.uints('colors'),
        defense: definition.int('defense'),
        attack: definition.int('attack'),
        attackMediaRefId: definition.int('attackMediaRefId'),
        combatType: definition.int('combatType'),
        modifierType: definition.int('modifierType'),
        modifierValue: definition.int('modifierValue'),
        criticalHit: definition.int('criticalHit'),
        availableFrom: definition.time('availabilityStartTime'),
        availableUntil: definition.time('availabilityEndTime'),
      }
    })
  }
}
