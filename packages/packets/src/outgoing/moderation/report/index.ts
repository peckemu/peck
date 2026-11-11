import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether a report was taken
 * @class
 */
@Packet(Outgoing.Report, 'xt')
export class ReportOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.bool() public readonly success: boolean = false

  /**
   * Says the report worked
   * @param room The target room
   * @returns The packet
   */
  public static done(room: number): ReportOutgoing {
    return PacketFactory.create<ReportOutgoing>(ReportOutgoing, {
      room,
      success: true,
    })
  }

  /**
   * Says the report failed
   * @param room The target room
   * @returns The packet
   */
  public static refused(room: number): ReportOutgoing {
    return PacketFactory.create<ReportOutgoing>(ReportOutgoing, {
      room,
      success: false,
    })
  }
}
