import { Catalogue } from '#game/catalogue'

/**
 * Who can come to a party
 */
export const PartyRestriction = {
  /**
   * Some animals only
   */
  Avatars: 1,

  /**
   * Members only
   */
  Members: 2,

  /**
   * With a pet
   */
  Pets: 4,

  /**
   * As a pet
   */
  PetsOnly: 8,
} as const

/**
 * A party
 */
export type PartyTemplate = {
  /**
   * The party's id in the party pack
   */
  readonly defId: number

  /**
   * The party's name
   */
  readonly name?: string | null

  /**
   * The party's name string id
   */
  readonly titleStrId: number

  /**
   * Who can come
   */
  readonly restrictions: number

  /**
   * The animals allowed
   */
  readonly avatarDefFlags: string

  /**
   * Whether it is a minigame
   */
  readonly isGame: boolean

  /**
   * Whether players host it
   */
  readonly isCustom: boolean

  /**
   * The venue room
   */
  readonly roomDefId: number
}

/**
 * Every party
 * @class
 */
export class PartyCatalogue extends Catalogue<PartyTemplate> {
  /**
   * Checks an animal may come to a party
   * @param party The party
   * @param avTypeId The animal
   * @returns Whether it may
   */
  public static allows(party: PartyTemplate, avTypeId: number): boolean {
    if ((party.restrictions & PartyRestriction.Avatars) === 0) return true

    const flags = BigInt(party.avatarDefFlags || '0')

    return avTypeId > 0 && ((flags >> BigInt(avTypeId - 1)) & 1n) === 1n
  }
}
