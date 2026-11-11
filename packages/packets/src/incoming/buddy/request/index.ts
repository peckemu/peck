import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks a player to be a buddy
 * @class
 */
@Packet(Incoming.BuddyRequest, 'xt')
export class BuddyRequestIncoming extends IncomingPacket {
  /**
   * The other player's username
   */
  @Field.string() public readonly userName: string = ''
}
