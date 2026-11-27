import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

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
