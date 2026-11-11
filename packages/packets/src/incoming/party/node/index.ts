import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for a hosted party's server
 * @class
 */
@Packet(Incoming.HostedPartyNode, 'xt')
export class HostedPartyNodeIncoming extends IncomingPacket {
  /**
   * The host's uuid
   */
  @Field.string() public readonly hostUuid: string = ''
}
