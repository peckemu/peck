import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Reports a player
 * @class
 */
@Packet(Incoming.Report, 'xt')
export class ReportIncoming extends IncomingPacket {
  /**
   * The player reported
   */
  @Field.string() public readonly userName: string = ''

  /**
   * The rule broken
   */
  @Field.int() public readonly reasonId: number = 0
}
