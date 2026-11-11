import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Names the player's referrer
 * @class
 */
@Packet(Incoming.ReferralAssociate, 'xt')
export class ReferralAssociateIncoming extends IncomingPacket {
  /**
   * The referrer's username
   */
  @Field.string() public readonly username: string = ''
}
