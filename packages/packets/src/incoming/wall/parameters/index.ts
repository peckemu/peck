import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Changes how the player's wall looks
 * @class
 */
@Packet(Incoming.WallParameters, 'xt')
export class WallParametersIncoming extends IncomingPacket {
  /**
   * What changed
   */
  @Field.string() public readonly changes: string = ''
}
