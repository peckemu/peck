import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '../../headers/index.ts'

/**
 * Why a referrer was refused
 */
export type ReferralRefusal = 'unknown' | 'failed'

/**
 * The status for each refusal
 */
const REFUSALS: Readonly<Record<ReferralRefusal, number>> = {
  unknown: -1,
  failed: 0,
}

/**
 * Whether the referrer was kept
 * @class
 */
@Packet(Outgoing.ReferralAssociate, 'xt')
export class ReferralAssociateOutgoing extends OutgoingPacket {
  /**
   * Whether it was
   */
  @Field.int() public readonly status: number = 0

  /**
   * Says the referrer was kept
   * @param room The target room
   * @returns The packet
   */
  public static recorded(room: number): ReferralAssociateOutgoing {
    return PacketFactory.create<ReferralAssociateOutgoing>(
      ReferralAssociateOutgoing,
      { room, status: 1 },
    )
  }

  /**
   * Says the referrer was refused
   * @param room The target room
   * @param refusal Why
   * @returns The packet
   */
  public static refused(
    room: number,
    refusal: ReferralRefusal,
  ): ReferralAssociateOutgoing {
    return PacketFactory.create<ReferralAssociateOutgoing>(
      ReferralAssociateOutgoing,
      { room, status: REFUSALS[refusal] },
    )
  }
}
