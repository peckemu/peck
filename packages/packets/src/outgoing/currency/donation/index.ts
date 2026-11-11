import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether a donation worked
 * @class
 */
@Packet(Outgoing.GemDonation, 'xt')
export class GemDonationOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.int() public readonly result: number = 0

  /**
   * Says the donation worked
   * @param room The target room
   * @returns The packet
   */
  public static donated(room: number): GemDonationOutgoing {
    return PacketFactory.create<GemDonationOutgoing>(GemDonationOutgoing, {
      room,
      result: 1,
    })
  }

  /**
   * Says the donation failed
   * @param room The target room
   * @returns The packet
   */
  public static refused(room: number): GemDonationOutgoing {
    return PacketFactory.create<GemDonationOutgoing>(GemDonationOutgoing, {
      room,
      result: 0,
    })
  }
}
