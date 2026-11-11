import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The referral code
 * @class
 */
@Packet(Outgoing.ReferralCode, 'xt')
export class ReferralCodeOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.int() public readonly status: number = 0

  /**
   * The code
   */
  @Field.string() public readonly code: string = ''

  /**
   * Sends the code
   * @param room The target room
   * @param code The code
   * @returns The packet
   */
  public static of(room: number, code: string): ReferralCodeOutgoing {
    return PacketFactory.create<ReferralCodeOutgoing>(ReferralCodeOutgoing, {
      room,
      status: 1,
      code,
    })
  }
}
