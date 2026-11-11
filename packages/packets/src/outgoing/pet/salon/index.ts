import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { type ShownPet } from '#packets/outgoing/pet/list'
import { Outgoing } from '#packets/outgoing/headers'

/**
 * The restyled pet
 * @class
 */
@Packet(Outgoing.PetSalon, 'xt')
export class PetSalonOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.int() public readonly status: number = 0

  /**
   * The rest
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Says the salon worked
   * @param room The target room
   * @param gems The gems afterwards
   * @param pet The pet
   * @returns The packet
   */
  public static success(
    room: number,
    gems: number,
    pet: ShownPet,
  ): PetSalonOutgoing {
    return PacketFactory.create<PetSalonOutgoing>(PetSalonOutgoing, {
      room,
      status: 1,
      body: [
        gems,
        pet.invId,
        pet.lBits >>> 0,
        pet.uBits >>> 0,
        pet.eBits >>> 0,
      ].map(String),
    })
  }

  /**
   * Says it didn't work
   * @param room The target room
   * @returns The packet
   */
  public static failure(room: number): PetSalonOutgoing {
    return PacketFactory.create<PetSalonOutgoing>(PetSalonOutgoing, {
      room,
      status: 0,
      body: [],
    })
  }
}
