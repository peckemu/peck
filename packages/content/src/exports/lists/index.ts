import { type Definition } from '#content/definition'
import { ContentExport, type Row } from '#content/exports/export'
import { type PackSet } from '#content/pack'
import { type Strings } from '#content/strings'
import { readNameWheels } from '#content/wheels'

/**
 * The lists' def packs
 */
const PACK = {
  types: 1038,
  avatars: 1003,
  diamonds: 1054,
  customAvatars: 1057,
  badges: 1049,
  newspapers: 1065,
} as const

/**
 * The client's lists by id
 */
const LIST = {
  animals: 64,
  currentDiamondAnimals: 166,
  diamondAnimals: 293,
  badges: 110,
  newspapers: 627,
  nameFirst: 200,
  nameMiddle: 202,
  nameLast: 203,
} as const

/**
 * The types of list bodies
 */
const TYPE = {
  clothing: 1000,
  avatars: 1003,
  strings: 1023,
  badges: 1049,
  diamondShop: 1054,
  newspapers: 1065,
} as const

/**
 * The list types
 */
const BUILT_IN_TYPES = new Map<number, number>([
  [LIST.animals, TYPE.avatars],
  [LIST.currentDiamondAnimals, TYPE.diamondShop],
  [LIST.diamondAnimals, TYPE.diamondShop],
  [LIST.badges, TYPE.badges],
  [LIST.newspapers, TYPE.newspapers],
  [LIST.nameFirst, TYPE.strings],
  [LIST.nameMiddle, TYPE.strings],
  [LIST.nameLast, TYPE.strings],
])

/**
 * Known custom pattern lists
 */
const CUSTOM_PATTERN_LISTS = new Map<number, readonly number[]>([
  [748, [1963, 1964, 1965, 1966]],
  [749, [1976]],
  [756, [1981]],
  [761, [2073]],
  [770, [2121]],
])

/**
 * The diamond shop's entry types
 */
const DIAMOND_TYPE = { avatar: 3, customAvatar: 5 } as const

/**
 * A generic list row
 */
type ListRow = Row & {
  readonly type: number
  readonly diamondCost: number
  readonly diamondBundle: boolean
  readonly ids: number[]
}

/**
 * Exports the generic lists
 * @class
 */
export class ListsExport extends ContentExport {
  /**
   * The file name
   */
  public readonly file = 'lists'

  /**
   * The pack ids it reads
   */
  public readonly packs = Object.values(PACK)

  /**
   * Reads the generic lists
   * @param packs The def packs
   * @param strings The English strings
   * @returns The lists
   */
  public rows(packs: PackSet, strings: Strings): Row[] {
    const lists = new Map<number, ListRow>()

    const add = (defId: number, type: number, ids: number[] = []): void => {
      const known = lists.get(defId)
      lists.set(defId, {
        defId,
        type: known?.type ?? type,
        diamondCost: known?.diamondCost ?? 0,
        diamondBundle: known?.diamondBundle ?? false,
        ids,
      })
    }

    for (const definition of packs.get(PACK.types).definitions()) {
      lists.set(definition.int('id'), {
        defId: definition.int('id'),
        type: definition.int('typeId'),
        diamondCost: definition.int('diamondCost'),
        diamondBundle: definition.flag('diamondPurchaseAll'),
        ids: [],
      })
    }

    for (const [defId, type] of BUILT_IN_TYPES) {
      if (!lists.has(defId)) add(defId, type)
    }

    const animals = packs
      .get(PACK.avatars)
      .definitions()
      .map((definition) => definition.int('id'))
    add(LIST.animals, TYPE.avatars, animals)

    const customs = packs.get(PACK.customAvatars).definitions()
    for (const [defId, ids] of ListsExport.patterns(customs)) {
      add(defId, TYPE.clothing, ids)
    }

    const diamonds = ListsExport.diamondAnimals(packs, animals, customs)
    add(
      LIST.diamondAnimals,
      TYPE.diamondShop,
      diamonds.map(({ id }) => id),
    )
    add(
      LIST.currentDiamondAnimals,
      TYPE.diamondShop,
      ListsExport.onSale(diamonds),
    )

    const badges = packs
      .get(PACK.badges)
      .definitions()
      .map((definition) => definition.int('id'))
    add(LIST.badges, TYPE.badges, badges)

    add(LIST.newspapers, TYPE.newspapers, ListsExport.newspapers(packs))

    const wheels = readNameWheels(strings)
    add(LIST.nameFirst, TYPE.strings, wheels.first)
    add(LIST.nameMiddle, TYPE.strings, wheels.middle)
    add(LIST.nameLast, TYPE.strings, wheels.last)

    return [...lists.values()]
  }

  /**
   * Builds the custom pattern lists
   * @param customs The custom animals
   * @returns The pattern lists by id
   */
  private static patterns(
    customs: readonly Definition[],
  ): Map<number, number[]> {
    const patterns = new Map<number, number[]>()

    for (const custom of customs) {
      const listId = custom.int('patternListRefId')
      if (custom.int('avatarIconRefId') === 0 || listId === 0) continue

      const list = patterns.get(listId) ?? [
        ...(CUSTOM_PATTERN_LISTS.get(listId) ?? []),
      ]
      const pattern = custom.int('patternRefId')
      if (pattern !== 0 && !list.includes(pattern)) list.push(pattern)

      patterns.set(listId, list)
    }

    return patterns
  }

  /**
   * Lists the diamond animals
   * @param packs The def packs
   * @param animals The animal ids
   * @param customs The custom animals
   * @returns The entries
   */
  private static diamondAnimals(
    packs: PackSet,
    animals: readonly number[],
    customs: readonly Definition[],
  ): { readonly id: number; readonly start: number; readonly end: number }[] {
    const known = new Set(animals)
    const custom = new Set(
      customs
        .filter((each) => each.int('avatarIconRefId') !== 0)
        .map((each) => each.int('id')),
    )

    return packs
      .get(PACK.diamonds)
      .definitions()
      .filter((entry) => {
        const type = entry.int('type')
        const refId = entry.int('refId')

        return (
          (type === DIAMOND_TYPE.avatar && known.has(refId)) ||
          (type === DIAMOND_TYPE.customAvatar && custom.has(refId))
        )
      })
      .map((entry) => ({
        id: entry.int('id'),
        start: entry.uint('availabilityStartTime'),
        end: entry.uint('availabilityEndTime'),
      }))
  }

  /**
   * Lists the diamond animals on sale now
   * @param entries The diamond animal entries
   * @returns The entry ids
   */
  private static onSale(
    entries: readonly {
      readonly id: number
      readonly start: number
      readonly end: number
    }[],
  ): number[] {
    const now = Math.floor(Date.now() / 1000)

    return entries
      .filter(
        ({ start, end }) =>
          start !== 0 && start <= now && (end === 0 || now <= end),
      )
      .map(({ id }) => id)
  }

  /**
   * Lists the newspaper issues out now
   * @param packs The def packs
   * @returns The issue ids
   */
  private static newspapers(packs: PackSet): number[] {
    const now = Math.floor(Date.now() / 1000)

    return packs
      .get(PACK.newspapers)
      .definitions()
      .map((issue) => ({
        id: issue.int('id'),
        start: issue.uint('availabilityStartTime'),
        end: issue.uint('availabilityEndTime'),
      }))
      .filter(
        ({ start, end }) =>
          start > 0 && start <= now && (end === 0 || end > now),
      )
      .sort((a, b) => b.start - a.start || b.id - a.id)
      .map(({ id }) => id)
  }
}
