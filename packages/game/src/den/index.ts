import { type Point } from '@peck/shared'

import { GameError } from '#game/error'

/**
 * Where an item stands in the den
 */
export type Placement = {
  /**
   * Where it stands
   */
  readonly position: Point

  /**
   * Whether it is flipped
   */
  readonly flipped: boolean
}

/**
 * A den room a player owns
 */
export type OwnedDenRoom = {
  /**
   * Its place in the player's den rooms
   */
  readonly invIdx: number

  /**
   * Its definition id
   */
  readonly defId: number
}

/**
 * A den item a player owns
 */
export type OwnedDenItem = {
  /**
   * Its place in the player's den items
   */
  readonly invIdx: number

  /**
   * Its definition id
   */
  readonly defId: number

  /**
   * Its layer, or 0
   */
  readonly categoryId: number

  /**
   * Its drawn look
   */
  readonly version: number

  /**
   * Where it stands across
   */
  readonly x: number

  /**
   * Where it stands down
   */
  readonly y: number

  /**
   * Whether it is flipped
   */
  readonly flipped: boolean

  /**
   * The den door's owner
   */
  readonly userNameLink: string

  /**
   * The den shop listing, or 0
   */
  readonly denStoreInvIdx: number

  /**
   * Its eco switch
   */
  readonly ecoConsumerState?: number | undefined

  /**
   * Its masterpiece id
   */
  readonly uniqueImageId?: string | undefined

  /**
   * The masterpiece it holds
   */
  readonly masterpiece?: DenItemMasterpiece | undefined
}

/**
 * A masterpiece on a den item
 */
export type DenItemMasterpiece = {
  /**
   * Its id
   */
  readonly uniqueImageId: string

  /**
   * Whether staff approved it
   */
  readonly approved: boolean

  /**
   * The painter
   */
  readonly creatorGameId: number

  /**
   * The painter's uuid
   */
  readonly creatorUuid: string
}

/**
 * A player's den
 * @class
 */
export class Den {
  /**
   * The den room's definition id
   */
  public defId: number

  /**
   * Whether other players may visit
   */
  public open = true

  /**
   * The placed items by inventory id
   */
  private readonly placed = new Map<number, Placement>()

  /**
   * Creates a den
   * @param defId The den room's definition id
   */
  public constructor(defId = 0) {
    this.defId = defId
  }

  /**
   * The placed items by inventory id
   */
  public get placements(): ReadonlyMap<number, Placement> {
    return this.placed
  }

  /**
   * Places or moves an item
   * @param invId The item's inventory id
   * @param position Where it stands
   * @param flipped Whether it is flipped
   */
  public place(invId: number, position: Point, flipped = false): void {
    this.placed.set(invId, {
      position: { x: position.x, y: position.y },
      flipped,
    })
  }

  /**
   * Puts a placed item back in the inventory
   * @param invId The item's inventory id
   */
  public store(invId: number): void {
    if (!this.placed.delete(invId)) {
      throw new GameError('Not placed in the den', 'NOT_FOUND')
    }
  }

  /**
   * Whether an item is placed
   * @param invId The item's inventory id
   * @returns Whether it is placed
   */
  public has(invId: number): boolean {
    return this.placed.has(invId)
  }

  /**
   * Checks for an unapproved masterpiece
   * @param item The den item
   * @returns Whether it does
   */
  public static unapproved(item: OwnedDenItem): boolean {
    return item.masterpiece?.approved === false
  }
}
