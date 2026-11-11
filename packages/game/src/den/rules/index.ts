import { DenPrivacy } from '@peck/shared'

import { type OwnedDenItem } from '#game/den'
import { type Player } from '#game/player'

/**
 * A den item
 */
export const DEN_ITEM = 0

/**
 * A pet
 */
export const DEN_PET = 1

/**
 * Where a den item or pet stands in a den room
 */
export type LayoutSpot = {
  /**
   * Den item 0 or pet 1
   */
  readonly refId: number

  /**
   * Its place in the player's den items or pets
   */
  readonly invIdx: number

  /**
   * Its layer
   */
  readonly categoryId: number

  /**
   * Where it stands across
   */
  readonly x: number

  /**
   * Where it stands down
   */
  readonly y: number

  /**
   * How it is flipped
   */
  readonly flipped: number
}

/**
 * What dens allow
 * @class
 */
export class DenRules {
  /**
   * Checks the owner lets a player in
   * @param owner The den's owner
   * @param visitor The player going in
   * @returns Whether they may go in
   */
  public static welcomes(owner: Player, visitor: Player): boolean {
    if (visitor.gameId === owner.gameId) return true
    if (visitor.buddies.blockedBy.has(owner.gameId)) return false
    if (owner.denPrivacy === DenPrivacy.Open) return true

    return (
      owner.denPrivacy === DenPrivacy.Buddies &&
      visitor.buddies.has(owner.username)
    )
  }

  /**
   * Checks a den privacy setting
   * @param privacy The setting
   * @returns Whether it is one
   */
  public static privacy(privacy: number): privacy is DenPrivacy {
    return (Object.values(DenPrivacy) as number[]).includes(privacy)
  }

  /**
   * Lists what stands in the den
   * @param player The owner
   * @returns The spots
   */
  public static layoutOf(player: Player): LayoutSpot[] {
    const items = player.denItems
      .filter(({ categoryId }) => categoryId !== 0)
      .map(({ invIdx, categoryId, x, y, flipped }) => ({
        refId: DEN_ITEM,
        invIdx,
        categoryId,
        x,
        y,
        flipped: flipped ? 1 : 0,
      }))

    const pets = player.placedPets.map((pet) => ({
      refId: DEN_PET,
      invIdx: pet.invId,
      categoryId: pet.denCategoryId,
      x: pet.denX,
      y: pet.denY,
      flipped: pet.denFlipped,
    }))

    return [...items, ...pets]
  }

  /**
   * Puts everything in the den back in the drawer
   * @param player The owner
   * @returns The items taken out
   */
  public static clear(player: Player): OwnedDenItem[] {
    const placed = player.denItems.filter(({ categoryId }) => categoryId !== 0)

    const stored = player.denItems.map((item) =>
      item.categoryId === 0 ? item : DenRules.stored(item),
    )
    player.denItems.splice(0, player.denItems.length, ...stored)

    for (const pet of player.placedPets) {
      pet.denCategoryId = 0
      pet.denX = 0
      pet.denY = 0
      pet.denFlipped = 0
    }

    return placed
  }

  /**
   * Places den items and pets
   * @param player The owner
   * @param spots Where they stand
   * @returns The spots used
   */
  public static arrange(
    player: Player,
    spots: readonly LayoutSpot[],
  ): LayoutSpot[] {
    return spots.filter((spot) => DenRules.place(player, spot))
  }

  /**
   * Places a den item or pet
   * @param player The owner
   * @param spot Where it stands
   * @returns Whether it was placed
   */
  private static place(player: Player, spot: LayoutSpot): boolean {
    if (spot.refId === DEN_PET) {
      const pet = player.pets.get(spot.invIdx)
      if (!pet) return false

      pet.denCategoryId = spot.categoryId
      pet.denX = spot.x
      pet.denY = spot.y
      pet.denFlipped = spot.flipped
      return true
    }

    const at = player.denItems.findIndex(({ invIdx }) => invIdx === spot.invIdx)
    const item = player.denItems[at]
    if (!item) return false

    player.denItems[at] = {
      ...item,
      categoryId: spot.categoryId,
      x: spot.x,
      y: spot.y,
      flipped: spot.flipped !== 0,
    }
    return true
  }

  /**
   * Puts a den item in the drawer
   * @param item The den item
   * @returns The stored item
   */
  private static stored(item: OwnedDenItem): OwnedDenItem {
    return { ...item, categoryId: 0, x: 0, y: 0, flipped: false }
  }
}
