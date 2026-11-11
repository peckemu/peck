import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for the hosted parties
 * @class
 */
@Packet(Incoming.HostedPartyList, 'xt')
export class HostedPartyListIncoming extends IncomingPacket {
  /**
   * The first to list
   */
  @Field.int() public readonly start: number = 0

  /**
   * How many to list
   */
  @Field.int() public readonly limit: number = 0
}
