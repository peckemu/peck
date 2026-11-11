import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { type ShownPet } from '#packets/outgoing/pet/list'
import { Outgoing } from '#packets/outgoing/headers'

/**
 * The rebadged pet
 * @class
 */
@Packet(Outgoing.PetMastery, 'xt')
export class PetMasteryOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.int() public readonly status: number = 0

  /**
   * The rest
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Says the badge changed
   * @param room The target room
   * @param pet The pet
   * @returns The packet
   */
  public static success(room: number, pet: ShownPet): PetMasteryOutgoing {
    return PacketFactory.create<PetMasteryOutgoing>(PetMasteryOutgoing, {
      room,
      status: 1,
      body: [pet.invId, pet.lBits >>> 0, pet.uBits >>> 0, pet.eBits >>> 0].map(
        String,
      ),
    })
  }

  /**
   * Says it didn't work
   * @param room The target room
   * @returns The packet
   */
  public static failure(room: number): PetMasteryOutgoing {
    return PacketFactory.create<PetMasteryOutgoing>(PetMasteryOutgoing, {
      room,
      status: 0,
      body: [],
    })
  }
}
