import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether the player has a referrer
 * @class
 */
@Packet(Outgoing.ReferralAssociated, 'xt')
export class ReferralAssociatedOutgoing extends OutgoingPacket {
  /**
   * Whether they do
   */
  @Field.int() public readonly status: number = 0

  /**
   * Says whether the player has a referrer
   * @param room The target room
   * @param associated Whether they do
   * @returns The packet
   */
  public static of(
    room: number,
    associated: boolean,
  ): ReferralAssociatedOutgoing {
    return PacketFactory.create<ReferralAssociatedOutgoing>(
      ReferralAssociatedOutgoing,
      { room, status: associated ? 1 : 0 },
    )
  }
}
