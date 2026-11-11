import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether the eco credits were redeemed
 * @class
 */
@Packet(Outgoing.DenEcoRedeem, 'xt')
export class DenEcoRedeemOutgoing extends OutgoingPacket {
  /**
   * Whether they were redeemed
   */
  @Field.bool() public readonly redeemed: boolean = false

  /**
   * Seconds to the next eco credit
   */
  @Field.optional(Field.int())
  public readonly secondsUntilNextEcoCredit?: number

  /**
   * Says the eco credits were redeemed
   * @param room The target room
   * @param secondsUntilNextEcoCredit Seconds to the next eco credit
   * @returns The packet
   */
  public static redeemed(
    room: number,
    secondsUntilNextEcoCredit: number,
  ): DenEcoRedeemOutgoing {
    return PacketFactory.create<DenEcoRedeemOutgoing>(DenEcoRedeemOutgoing, {
      room,
      redeemed: true,
      secondsUntilNextEcoCredit,
    })
  }

  /**
   * Says the eco credits were not redeemed
   * @param room The target room
   * @returns The packet
   */
  public static refused(room: number): DenEcoRedeemOutgoing {
    return PacketFactory.create<DenEcoRedeemOutgoing>(DenEcoRedeemOutgoing, {
      room,
      redeemed: false,
    })
  }
}
