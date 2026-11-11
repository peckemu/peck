import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Reports a player with evidence
 * @class
 */
@Packet(Incoming.ReportEvidence, 'xt')
export class ReportEvidenceIncoming extends IncomingPacket {
  /**
   * The player reported
   */
  @Field.string() public readonly userName: string = ''

  /**
   * The rule broken
   */
  @Field.int() public readonly reasonId: number = 0

  /**
   * The kind of thing reported
   */
  @Field.int() public readonly dataType: number = 0

  /**
   * The thing reported
   */
  @Field.string() public readonly data: string = ''
}
