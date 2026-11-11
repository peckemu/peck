import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether a report with evidence was taken
 * @class
 */
@Packet(Outgoing.ReportEvidence, 'xt')
export class ReportEvidenceOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.bool() public readonly success: boolean = false

  /**
   * Says the report worked
   * @param room The target room
   * @returns The packet
   */
  public static done(room: number): ReportEvidenceOutgoing {
    return PacketFactory.create<ReportEvidenceOutgoing>(
      ReportEvidenceOutgoing,
      {
        room,
        success: true,
      },
    )
  }

  /**
   * Says the report failed
   * @param room The target room
   * @returns The packet
   */
  public static refused(room: number): ReportEvidenceOutgoing {
    return PacketFactory.create<ReportEvidenceOutgoing>(
      ReportEvidenceOutgoing,
      {
        room,
        success: false,
      },
    )
  }
}
