import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for a host's time left
 * @class
 */
@Packet(Incoming.HostingTime, 'xt')
export class HostingTimeIncoming extends IncomingPacket {
  /**
   * The player's uuid
   */
  @Field.string() public readonly uuid: string = ''
}
