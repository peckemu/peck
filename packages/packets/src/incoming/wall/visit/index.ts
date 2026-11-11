import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Counts a visit to a wall
 * @class
 */
@Packet(Incoming.WallVisit, 'xt')
export class WallVisitIncoming extends IncomingPacket {
  /**
   * Whose wall
   */
  @Field.string() public readonly userName: string = ''
}
