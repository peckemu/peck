import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Kicks a player
 * @class
 */
@Packet(Incoming.Kick, 'xt')
export class KickIncoming extends IncomingPacket {
  /**
   * The player
   */
  @Field.string() public readonly userName: string = ''

  /**
   * The moderator's note
   */
  @Field.string() public readonly note: string = ''
}
