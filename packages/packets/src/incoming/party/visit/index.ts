import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Goes to a party a player hosts
 * @class
 */
@Packet(Incoming.HostedPartyJoin, 'xt')
export class HostedPartyJoinIncoming extends IncomingPacket {
  /**
   * The host's uuid
   */
  @Field.string() public readonly hostUuid: string = ''
}
