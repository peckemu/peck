import { type Avatar } from '#game/avatar'
import { type ItemCatalogue, type ItemTemplate } from '#game/content/item'
import { type Player } from '#game/player'

/**
 * A body mod's type
 */
const BODY_MOD = 0

/**
 * Clothing's type
 */
const CLOTHING = 1

/**
 * The layers body mods go on
 */
const LAYER = { pattern: 2, eyes: 3 } as const

/**
 * The body slot
 */
const BODY = -1

/**
 * The most an animal wears
 */
const MOST_WORN = 16

/**
 * What came of dressing
 */
export type Dressed = {
  /**
   * The items put on
   */
  readonly added: { readonly invId: number; readonly defId: number }[]

  /**
   * The items taken off
   */
  readonly removed: number[]

  /**
   * The changed items
   */
  readonly changed: number[]
}

/**
 * Dresses animals
 * @class
 */
export class Wardrobe {
  /**
   * Every clothing item
   */
  private readonly items: ItemCatalogue

  /**
   * Creates the wardrobe
   * @param items Every clothing item
   */
  public constructor(items: ItemCatalogue) {
    this.items = items
  }

  /**
   * Dresses an animal
   * @param player The player
   * @param avatar The animal
   * @param wear What to put on
   * @param remove What to take off
   * @returns The change, or the refusal
   */
  public dress(
    player: Player,
    avatar: Avatar,
    wear: readonly number[],
    remove: readonly number[],
  ): Dressed | { readonly refusal: string } {
    const worn = new Set(player.worn(avatar).map(({ invId }) => invId))
    const before = new Set(worn)
    const madeRoom: number[] = []
    let eyes = avatar.eyesDefId
    let pattern = avatar.patternDefId

    for (const invId of remove) {
      if (invId < 0 && -invId === pattern) pattern = 0
      if (invId > 0) worn.delete(invId)
    }

    for (const invId of wear) {
      if (invId === BODY) continue
      if (invId === 0) return { refusal: 'nothing' }

      if (invId < 0) {
        const def = this.items.get(-invId)
        const refusal = this.refusal(def, avatar, player.member, BODY_MOD)
        if (refusal !== null || !def) return { refusal: refusal ?? 'unknown' }

        if (def.layerId === LAYER.eyes) eyes = def.defId
        else if (def.layerId === LAYER.pattern) pattern = def.defId
        else return { refusal: 'not eyes or a pattern' }
        continue
      }

      const item = player.items.get(invId)
      if (item?.denStoreInvIdx !== 0) return { refusal: 'not theirs' }

      const def = this.items.get(item.defId)
      const refusal = this.refusal(def, avatar, player.member, CLOTHING)
      if (refusal !== null || !def) return { refusal: refusal ?? 'unknown' }

      for (const other of worn) {
        const otherDef = this.items.get(player.items.get(other)?.defId ?? 0)
        if (other === invId || !otherDef) continue
        if (
          otherDef.layerId !== def.layerId ||
          otherDef.enviroType !== def.enviroType
        ) {
          continue
        }

        worn.delete(other)
        madeRoom.push(other)
      }
      worn.add(invId)
    }

    if (worn.size > MOST_WORN) return { refusal: 'too much worn' }

    const changed = [...new Set([...before, ...worn])].filter(
      (invId) => before.has(invId) !== worn.has(invId),
    )
    for (const invId of changed) {
      const item = player.items.get(invId)
      if (!item) continue

      if (worn.has(invId)) item.wornBy.add(avatar.invId)
      else item.wornBy.delete(avatar.invId)
    }
    avatar.eyesDefId = eyes
    avatar.patternDefId = pattern

    return {
      added: wear
        .filter((invId) => invId !== BODY)
        .map((invId) => ({
          invId,
          defId: invId < 0 ? -invId : (player.items.get(invId)?.defId ?? 0),
        })),
      removed: [
        ...remove,
        ...madeRoom.filter((invId) => !remove.includes(invId)),
      ],
      changed,
    }
  }

  /**
   * Finds why an item can't be worn
   * @param def The item
   * @param avatar The animal
   * @param member Whether the player is a member
   * @param type The type it must be
   * @returns The reason, or null
   */
  private refusal(
    def: ItemTemplate | null,
    avatar: Avatar,
    member: boolean,
    type: number,
  ): string | null {
    if (def?.type !== type) return 'not wearable'
    if (def.membersOnly && !member) return 'members only'

    return (def.avatarUseFlags >>> (avatar.typeId - 1)) & 1
      ? null
      : 'not for this animal'
  }
}
