import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A player's adopt a pet cards
 * @class
 */
@Packet(Outgoing.AdoptAPets, 'xt')
export class AdoptAPetsOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.int() public readonly status: number = 0

  /**
   * The rest
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Lists no cards
   * @param room The target room
   * @returns The packet
   */
  public static none(room: number): AdoptAPetsOutgoing {
    return PacketFactory.create<AdoptAPetsOutgoing>(AdoptAPetsOutgoing, {
      room,
      status: 1,
      body: ['0'],
    })
  }

  /**
   * Says it didn't work
   * @param room The target room
   * @returns The packet
   */
  public static failure(room: number): AdoptAPetsOutgoing {
    return PacketFactory.create<AdoptAPetsOutgoing>(AdoptAPetsOutgoing, {
      room,
      status: 0,
      body: [],
    })
  }
}
