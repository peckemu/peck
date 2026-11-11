import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * How many adopt a pet cards a player has
 * @class
 */
@Packet(Outgoing.AdoptAPetCount, 'xt')
export class AdoptAPetCountOutgoing extends OutgoingPacket {
  /**
   * How many
   */
  @Field.int() public readonly count: number = 0

  /**
   * Says how many cards
   * @param room The target room
   * @param count How many
   * @returns The packet
   */
  public static of(room: number, count: number): AdoptAPetCountOutgoing {
    return PacketFactory.create<AdoptAPetCountOutgoing>(
      AdoptAPetCountOutgoing,
      { room, count },
    )
  }
}
