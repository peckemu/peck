import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks for an adopt a pet card count
 * @class
 */
@Packet(Incoming.AdoptAPetCount, 'xt')
export class AdoptAPetCountIncoming extends IncomingPacket {
  /**
   * Whose cards
   */
  @Field.string() public readonly userName: string = ''
}
