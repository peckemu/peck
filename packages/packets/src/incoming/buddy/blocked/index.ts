import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks whether a player blocks this one
 * @class
 */
@Packet(Incoming.BlockInfo, 'xt')
export class BlockInfoIncoming extends IncomingPacket {
  /**
   * The other player's username
   */
  @Field.string() public readonly userName: string = ''
}
