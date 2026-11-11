import { ON_SALE, UserVar, UserVarType } from '@peck/shared'

import { type Avatar } from '#game/avatar'
import { type AvatarCatalogue, type AvatarTemplate } from '#game/content/avatar'
import { type DiamondCatalogue, DiamondType } from '#game/content/diamond'
import { type GenericListCatalogue } from '#game/content/list'
import { type Player, type UserVariable } from '#game/player'
import { type Cost } from '#game/shop/price'

/**
 * The name wheels
 */
const NAME_WHEELS = [200, 202, 203] as const

/**
 * The gems currency
 */
const GEMS = 0

/**
 * The diamonds currency
 */
const DIAMONDS = 3

/**
 * An animal's worlds
 */
const WORLD = { land: 1, ocean: 2 } as const

/**
 * Every slot open
 */
const ALL_SLOTS = 0xffffffff

/**
 * How many slots a player has
 */
const SLOTS = 1000

/**
 * The highest bit an unlock field holds
 */
const HIGHEST_BIT = 30

/**
 * What animals can do
 * @class
 */
export class AvatarRules {
  /**
   * Every animal
   */
  private readonly animals: AvatarCatalogue

  /**
   * Every generic list
   */
  private readonly lists: GenericListCatalogue

  /**
   * Every diamond shop entry
   */
  private readonly diamonds: DiamondCatalogue

  /**
   * Creates the rules
   * @param animals Every animal
   * @param lists Every generic list
   * @param diamonds Every diamond shop entry
   */
  public constructor(
    animals: AvatarCatalogue,
    lists: GenericListCatalogue,
    diamonds: DiamondCatalogue,
  ) {
    this.animals = animals
    this.lists = lists
    this.diamonds = diamonds
  }

  /**
   * Checks a creator name
   * @param nameIds The name's string ids
   * @returns The name, or null
   */
  public nameOf(nameIds: readonly number[]): string | null {
    if (nameIds.length !== NAME_WHEELS.length) return null

    const onWheels = nameIds.every((id, index) => {
      const wheel = this.lists.get(NAME_WHEELS[index] ?? 0)

      return (
        Number.isInteger(id) && id > 0 && (wheel?.ids.includes(id) ?? false)
      )
    })

    return onWheels ? nameIds.join('|') : null
  }

  /**
   * Prices an animal
   * @param player The player
   * @param animal The animal
   * @param diamondDefId The diamond shop entry, or -1
   * @returns The cost, or null
   */
  public price(
    player: Player,
    animal: AvatarTemplate,
    diamondDefId: number,
  ): Cost | null {
    const gems = {
      currency: GEMS,
      amount: AvatarRules.discounted(animal.cost, animal.status),
    }
    const unlocked = AvatarRules.unlocked(player, animal.defId)

    if (diamondDefId <= 0) {
      return unlocked ||
        !this.diamonds.selling(DiamondType.Avatar, animal.defId)
        ? gems
        : null
    }

    const entry = this.diamonds.get(diamondDefId)
    if (entry?.type !== DiamondType.Avatar || entry.refId !== animal.defId) {
      return null
    }
    if (unlocked) return gems

    return {
      currency: DIAMONDS,
      amount: AvatarRules.discounted(entry.cost, entry.status),
    }
  }

  /**
   * Finds an animal's refund
   * @param avTypeId The kind of animal
   * @returns The gems
   */
  public recycleValue(avTypeId: number): number {
    const animal = this.animals.get(avTypeId)

    return animal ? Math.ceil(animal.cost * 0.5) : 0
  }

  /**
   * Checks an animal can be in a world
   * @param avTypeId The kind of animal
   * @param ocean Whether it is the ocean
   * @returns Whether it can
   */
  public fits(avTypeId: number, ocean: boolean): boolean {
    const animal = this.animals.get(avTypeId)
    if (!animal) return this.animals.size === 0

    return (animal.enviroTypeFlags & (ocean ? WORLD.ocean : WORLD.land)) !== 0
  }

  /**
   * Checks for a members only animal
   * @param avTypeId The kind of animal
   * @returns Whether it is
   */
  public membersOnly(avTypeId: number): boolean {
    return this.animals.get(avTypeId)?.membersOnly ?? false
  }

  /**
   * Checks the player has unlocked an animal
   * @param player The player
   * @param avTypeId The kind of animal
   * @returns Whether they have
   */
  public static unlocked(player: Player, avTypeId: number): boolean {
    const value = player.variables.get(UserVar.AvatarViewableFlag)?.value
    if (value === undefined || (value | 0) === -1) return true

    const bit = avTypeId - 1
    if (bit < 0 || bit > HIGHEST_BIT) return false

    return ((value >>> bit) & 1) === 1
  }

  /**
   * Unlocks an animal
   * @param player The player
   * @param avTypeId The kind of animal
   * @returns The variable, or null
   */
  public static unlocking(
    player: Player,
    avTypeId: number,
  ): UserVariable | null {
    const bit = avTypeId - 1
    if (
      bit < 0 ||
      bit > HIGHEST_BIT ||
      AvatarRules.unlocked(player, avTypeId)
    ) {
      return null
    }

    const kept = player.variables.get(UserVar.AvatarViewableFlag)

    return {
      varId: UserVar.AvatarViewableFlag,
      type: kept?.type ?? UserVarType.BitField,
      value: ((kept?.value ?? 0) | (1 << bit)) >>> 0,
    }
  }

  /**
   * Checks the player can switch animal
   * @param player The player
   * @param avatar The animal
   * @returns Whether they can
   */
  public static usable(player: Player, avatar: Avatar): boolean {
    if (player.member && avatar.invId < SLOTS) return true

    const slot = avatar.invId + 1
    const flags = player.avatarSlotFlags >>> 0

    return (
      flags === ALL_SLOTS || (flags & 0xffff) === slot || flags >>> 16 === slot
    )
  }

  /**
   * Finds the first free slot
   * @param player The player
   * @returns The slot, or null
   */
  public static freeSlot(player: Player): number | null {
    for (let slot = 0; slot < SLOTS; slot++) {
      if (!player.avatars.has(slot)) return slot
    }

    return null
  }

  /**
   * Checks the player has a slot to open
   * @param player The player
   * @returns Whether they have
   */
  public static canOpen(player: Player): boolean {
    const flags = player.avatarSlotFlags >>> 0

    return (
      player.member ||
      flags === ALL_SLOTS ||
      (flags & 0xffff) === 0 ||
      flags >>> 16 === 0
    )
  }

  /**
   * Opens a slot for a new animal
   * @param player The player
   * @param slot The slot
   * @returns The new slot flags
   */
  public static opening(player: Player, slot: number): number {
    const flags = player.avatarSlotFlags >>> 0
    if (player.member) return flags

    if ((flags & 0xffff) === 0) return (flags | (slot + 1)) >>> 0
    if (flags >>> 16 === 0) return (flags | ((slot + 1) << 16)) >>> 0

    return flags
  }

  /**
   * Works out the slots a choice keeps
   * @param player The player
   * @param slots The slots chosen
   * @returns The new slot flags
   */
  public static choosing(player: Player, slots: readonly number[]): number {
    if (player.member) return ALL_SLOTS

    const [first = -1, second = -1] = slots

    return ((first + 1) | ((second + 1) << 16)) >>> 0
  }

  /**
   * Takes off a sale discount
   * @param cost The full cost
   * @param status The store status
   * @returns The cost
   */
  private static discounted(cost: number, status: number): number {
    return status === ON_SALE ? Math.ceil(cost * 0.5) : cost
  }
}
