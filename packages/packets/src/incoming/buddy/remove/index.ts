import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Ends a buddyship
 * @class
 */
@Packet(Incoming.BuddyRemove, 'xt')
export class BuddyRemoveIncoming extends IncomingPacket {
  /**
   * The other player's username
   */
  @Field.string() public readonly userName: string = ''
}
