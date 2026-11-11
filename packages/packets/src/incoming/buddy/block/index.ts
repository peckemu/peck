import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Blocks a player
 * @class
 */
@Packet(Incoming.Block, 'xt')
export class BlockIncoming extends IncomingPacket {
  /**
   * The other player's username
   */
  @Field.string() public readonly userName: string = ''
}
