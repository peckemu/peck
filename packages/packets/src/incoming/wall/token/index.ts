import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks for a wall's token
 * @class
 */
@Packet(Incoming.WallToken, 'xt')
export class WallTokenIncoming extends IncomingPacket {
  /**
   * Whose wall
   */
  @Field.string() public readonly userName: string = ''
}
