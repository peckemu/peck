import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A pet was named
 * @class
 */
@Packet(Outgoing.PetName, 'xt')
export class PetNameOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.int() public readonly status: number = 0

  /**
   * The rest
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Says the pet was named
   * @param room The target room
   * @param invId The pet
   * @param name Its name
   * @returns The packet
   */
  public static success(
    room: number,
    invId: number,
    name: string,
  ): PetNameOutgoing {
    return PacketFactory.create<PetNameOutgoing>(PetNameOutgoing, {
      room,
      status: 1,
      body: [String(invId), name],
    })
  }

  /**
   * Says it didn't work
   * @param room The target room
   * @returns The packet
   */
  public static failure(room: number): PetNameOutgoing {
    return PacketFactory.create<PetNameOutgoing>(PetNameOutgoing, {
      room,
      status: 0,
      body: [],
    })
  }
}
