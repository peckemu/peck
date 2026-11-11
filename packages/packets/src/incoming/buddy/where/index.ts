import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks where a buddy is
 * @class
 */
@Packet(Incoming.BuddyWhere, 'xt')
export class BuddyWhereIncoming extends IncomingPacket {
  /**
   * The other player's username
   */
  @Field.string() public readonly userName: string = ''
}
