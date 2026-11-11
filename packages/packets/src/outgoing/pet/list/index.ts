import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A pet view
 */
export type ShownPet = {
  /**
   * Its place in the owner's pets
   */
  readonly invId: number

  /**
   * The adoption time in seconds
   */
  readonly createdTs: number

  /**
   * Its name
   */
  readonly name: string

  /**
   * Its look
   */
  readonly lBits: number

  /**
   * Extra traits
   */
  readonly uBits: number

  /**
   * Unused look bits
   */
  readonly eBits: number

  /**
   * Its mastery points
   */
  readonly masteryCounter: number

  /**
   * Its personality
   */
  readonly personalityDefId: number

  /**
   * Its favourite toy
   */
  readonly favoriteToyDefId: number

  /**
   * Its favourite food
   */
  readonly favoriteFoodDefId: number

  /**
   * The den shop listing, or 0
   */
  readonly denStoreInvIdx: number
}

/**
 * A player's pets
 * @class
 */
@Packet(Outgoing.PetList, 'xt')
export class PetListOutgoing extends OutgoingPacket {
  /**
   * Whether there is a list
   */
  @Field.int() public readonly found: number = 1

  /**
   * The list
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Lists a player's pets
   * @param room The target room
   * @param userName Whose pets
   * @param pets The pets
   * @returns The packet
   */
  public static of(
    room: number,
    userName: string,
    pets: readonly ShownPet[],
  ): PetListOutgoing {
    const body = pets.flatMap((pet) => [
      String(pet.invId),
      String(pet.createdTs),
      pet.name,
      String(pet.lBits >>> 0),
      String(pet.uBits >>> 0),
      String(pet.eBits >>> 0),
      String(pet.masteryCounter),
      String(pet.personalityDefId),
      String(pet.favoriteToyDefId),
      String(pet.favoriteFoodDefId),
      String(pet.denStoreInvIdx),
    ])

    return PacketFactory.create<PetListOutgoing>(PetListOutgoing, {
      room,
      found: 1,
      body: [userName, String(pets.length), ...body],
    })
  }

  /**
   * Says there is no such player
   * @param room The target room
   * @returns The packet
   */
  public static missing(room: number): PetListOutgoing {
    return PacketFactory.create<PetListOutgoing>(PetListOutgoing, {
      room,
      found: 0,
      body: [],
    })
  }
}
