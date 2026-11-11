import { type AvatarCatalogue } from '#game/content/avatar'
import { type GenericListCatalogue } from '#game/content/list'
import { type PetCatalogue, type PetTemplate } from '#game/content/pet'
import { type Pet } from '#game/pet'
import { type Player } from '#game/player'

/**
 * The pet name lists
 */
const NAME_LISTS = [205, 206] as const

/**
 * The colours per table
 */
const COLOURS = 20

/**
 * An animal's worlds
 */
const WORLD = { land: 1, ocean: 2, air: 4 } as const

/**
 * A pet creator look
 */
export type PetLookRequest = {
  /**
   * Its look
   */
  readonly lBits: number

  /**
   * More traits
   */
  readonly uBits: number

  /**
   * Unused look bits
   */
  readonly eBits: number
}

/**
 * What pets can do
 * @class
 */
export class PetRules {
  /**
   * Every pet
   */
  private readonly pets: PetCatalogue

  /**
   * Every animal
   */
  private readonly animals: AvatarCatalogue

  /**
   * Every generic list
   */
  private readonly lists: GenericListCatalogue

  /**
   * Creates the rules
   * @param pets Every pet
   * @param animals Every animal
   * @param lists Every generic list
   */
  public constructor(
    pets: PetCatalogue,
    animals: AvatarCatalogue,
    lists: GenericListCatalogue,
  ) {
    this.pets = pets
    this.animals = animals
    this.lists = lists
  }

  /**
   * Checks a pet can follow
   * @param player The player
   * @param pet The pet
   * @param ocean Whether in the ocean
   * @returns Whether it can
   */
  public canFollow(player: Player, pet: Pet, ocean: boolean): boolean {
    const definition = this.pets.get(pet.defId)
    if (!definition) return this.pets.size === 0
    if (definition.membersOnly && !player.member) return false

    const egg = definition.egg && !pet.hatched(Math.floor(Date.now() / 1000))
    if (!PetRules.goesIn(definition.type, egg, ocean)) return false

    const animal = player.avatar ? this.animals.get(player.avatar.typeId) : null

    return (
      !animal || PetRules.follows(definition.type, egg, animal.enviroTypeFlags)
    )
  }

  /**
   * Checks a two part creator name
   * @param first The first part
   * @param second The second part
   * @returns The name, or null
   */
  public nameOf(first: number, second: number): string | null {
    if (first <= 0 || second <= 0) return null

    const [firsts = [], seconds = []] = NAME_LISTS.map(
      (listId) => this.lists.get(listId)?.ids ?? [],
    )
    if (firsts.length > 0 && seconds.length > 0) {
      const either =
        (firsts.includes(first) && seconds.includes(second)) ||
        (seconds.includes(first) && firsts.includes(second))
      if (!either) return null
    }

    return `${String(first)}|${String(second)}`
  }

  /**
   * Finds why a pet can't be adopted
   * @param player The player
   * @param definition The pet's definition
   * @param look The wanted look
   * @param name Its name, or null
   * @returns The reason, or null
   */
  public adoptionRefusal(
    player: Player,
    definition: PetTemplate,
    look: PetLookRequest,
    name: string | null,
  ): string | null {
    const lBits = look.lBits >>> 0

    if (definition.membersOnly && !player.member) return 'members only'
    if (look.uBits >>> 8 !== 0 || look.eBits >>> 0 !== 0) {
      return 'not a look the creator makes'
    }
    if (((lBits >> 8) & 0x3f) >= COLOURS || ((lBits >> 14) & 0x1f) >= COLOURS) {
      return 'no such colour'
    }
    if (name === null) return 'not a name'

    return null
  }

  /**
   * Picks a random entry from a list
   * @param listId The list
   * @returns The entry, or 0
   */
  public pick(listId: number): number {
    const ids = this.lists.get(listId)?.ids ?? []

    return ids[Math.floor(Math.random() * ids.length)] ?? 0
  }

  /**
   * Checks a player is in the ocean
   * @param player The player
   * @returns Whether they are
   */
  public static inOcean(player: Player): boolean {
    return player.room?.template.enviroType === 1
  }

  /**
   * Checks a pet goes in a world
   * @param type The pet's type
   * @param egg Whether it is an unhatched egg
   * @param ocean Whether it is the ocean
   * @returns Whether it does
   */
  private static goesIn(type: number, egg: boolean, ocean: boolean): boolean {
    if (egg || type === 0 || type === 1) return !ocean
    if (type === 2 || type === 3) return ocean

    return true
  }

  /**
   * Checks a pet follows an animal
   * @param type The pet's type
   * @param egg Whether it is an unhatched egg
   * @param flags The animal's worlds
   * @returns Whether it does
   */
  private static follows(type: number, egg: boolean, flags: number): boolean {
    const land = (flags & WORLD.land) !== 0
    const ocean = (flags & WORLD.ocean) !== 0
    const air = (flags & WORLD.air) !== 0

    if (egg || type === 0) return !air && land
    if (type === 1) return air || land
    if (type === 2 || type === 3) return ocean
    if (type === 4) return !air && (land || ocean)
    if (type === 5) return land || ocean

    return false
  }
}
