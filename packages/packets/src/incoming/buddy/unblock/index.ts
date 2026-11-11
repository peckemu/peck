import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Unblocks a player
 * @class
 */
@Packet(Incoming.Unblock, 'xt')
export class UnblockIncoming extends IncomingPacket {
  /**
   * The other player's username
   */
  @Field.string() public readonly userName: string = ''
}
