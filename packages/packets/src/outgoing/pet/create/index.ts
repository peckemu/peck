import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { type ShownPet } from '#packets/outgoing/pet/list'
import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether a pet was adopted
 * @class
 */
@Packet(Outgoing.PetCreate, 'xt')
export class PetCreateOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.int() public readonly status: number = 0

  /**
   * The rest
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Says the pet was adopted
   * @param room The target room
   * @param balance The balance afterwards
   * @param currencyType The balance's currency
   * @param pet The pet
   * @param broughtOut Whether it was brought out
   * @returns The packet
   */
  public static success(
    room: number,
    balance: number,
    currencyType: number,
    pet: ShownPet,
    broughtOut: boolean,
  ): PetCreateOutgoing {
    const body = [
      String(balance),
      String(currencyType),
      String(pet.invId),
      String(pet.lBits >>> 0),
      String(pet.uBits >>> 0),
      String(pet.eBits >>> 0),
      pet.name,
      String(pet.createdTs),
      String(pet.personalityDefId),
      String(pet.favoriteToyDefId),
      String(pet.favoriteFoodDefId),
      broughtOut ? '1' : '0',
    ]

    return PacketFactory.create<PetCreateOutgoing>(PetCreateOutgoing, {
      room,
      status: 1,
      body,
    })
  }

  /**
   * Says it didn't work
   * @param room The target room
   * @returns The packet
   */
  public static failure(room: number): PetCreateOutgoing {
    return PacketFactory.create<PetCreateOutgoing>(PetCreateOutgoing, {
      room,
      status: 0,
      body: [],
    })
  }
}
