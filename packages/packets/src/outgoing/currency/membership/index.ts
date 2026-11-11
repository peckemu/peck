import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A membership was redeemed
 * @class
 */
@Packet(Outgoing.MembershipRedeemed, 'xt')
export class MembershipRedeemedOutgoing extends OutgoingPacket {
  /**
   * Whether it was
   */
  @Field.int() public readonly result: number = 0

  /**
   * The new account type
   */
  @Field.int() public readonly accountType: number = 0

  /**
   * The membership days left
   */
  @Field.int() public readonly daysLeft: number = 0

  /**
   * Where the membership came from
   */
  @Field.string() public readonly sourceType: string = ''

  /**
   * Says a membership was redeemed
   * @param accountType The new account type
   * @param daysLeft The membership days left
   * @param sourceType Where it came from
   * @returns The packet
   */
  public static redeemed(
    accountType: number,
    daysLeft: number,
    sourceType: string,
  ): MembershipRedeemedOutgoing {
    return PacketFactory.create<MembershipRedeemedOutgoing>(
      MembershipRedeemedOutgoing,
      { room: -1, result: 1, accountType, daysLeft, sourceType },
    )
  }
}
