import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { type ShownPet } from '#packets/outgoing/pet/list'
import { Outgoing } from '#packets/outgoing/headers'

/**
 * A player's pet
 * @class
 */
@Packet(Outgoing.PetSwitch, 'xt')
export class PetSwitchOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.int() public readonly status: number = 0

  /**
   * The rest
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Sends the player's pet
   * @param room The room
   * @param userId The player's session id
   * @param invId The pet, or 0
   * @returns The packet
   */
  public static own(
    room: number,
    userId: number,
    invId: number,
  ): PetSwitchOutgoing {
    return PacketFactory.create<PetSwitchOutgoing>(PetSwitchOutgoing, {
      room,
      status: 1,
      body: [String(userId), String(invId)],
    })
  }

  /**
   * Sends a player's pet to the room
   * @param room The room
   * @param userId The player's session id
   * @param pet The pet, or null
   * @returns The packet
   */
  public static other(
    room: number,
    userId: number,
    pet: ShownPet | null,
  ): PetSwitchOutgoing {
    const body = pet
      ? [
          String(pet.lBits >>> 0),
          String(pet.uBits >>> 0),
          String(pet.eBits >>> 0),
          pet.name,
          String(pet.createdTs),
          String(pet.personalityDefId),
          String(pet.favoriteFoodDefId),
          String(pet.favoriteToyDefId),
        ]
      : ['0', '0', '0', '', '0', '0', '0', '0']

    return PacketFactory.create<PetSwitchOutgoing>(PetSwitchOutgoing, {
      room,
      status: 1,
      body: [String(userId), ...body],
    })
  }

  /**
   * Says it didn't work
   * @param room The target room
   * @returns The packet
   */
  public static failure(room: number): PetSwitchOutgoing {
    return PacketFactory.create<PetSwitchOutgoing>(PetSwitchOutgoing, {
      room,
      status: 0,
      body: [],
    })
  }
}
