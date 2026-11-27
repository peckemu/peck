import { Field, OutgoingPacket, Packet } from '@peck/protocol'

import { Outgoing } from '../../headers/index.ts'

/**
 * Whether a visit was counted
 * @class
 */
@Packet(Outgoing.WallVisit, 'xt')
export class WallVisitOutgoing extends OutgoingPacket {
  /**
   * Whether it was
   */
  @Field.int() public readonly result: number = 0
}
