import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for a player's adopt a pet cards
 * @class
 */
@Packet(Incoming.AdoptAPets, 'xt')
export class AdoptAPetsIncoming extends IncomingPacket {
  /**
   * Whose cards
   */
  @Field.string() public readonly userName: string = ''
}
