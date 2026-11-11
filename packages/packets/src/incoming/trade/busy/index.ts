import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Sends the busy state
 * @class
 */
@Packet(Incoming.TradeBusy, 'xt')
export class TradeBusyIncoming extends IncomingPacket {
  /**
   * Whether they are busy
   */
  @Field.int() public readonly busy: number = 0
}
