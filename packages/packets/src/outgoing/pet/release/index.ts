import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether a pet was freed
 * @class
 */
@Packet(Outgoing.PetRelease, 'xt')
export class PetReleaseOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.int() public readonly status: number = 0

  /**
   * The rest
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Says the pet was freed
   * @param room The target room
   * @param invId The pet
   * @returns The packet
   */
  public static success(room: number, invId: number): PetReleaseOutgoing {
    return PacketFactory.create<PetReleaseOutgoing>(PetReleaseOutgoing, {
      room,
      status: 1,
      body: [String(invId)],
    })
  }

  /**
   * Says it didn't work
   * @param room The target room
   * @returns The packet
   */
  public static failure(room: number): PetReleaseOutgoing {
    return PacketFactory.create<PetReleaseOutgoing>(PetReleaseOutgoing, {
      room,
      status: 0,
      body: [],
    })
  }
}
