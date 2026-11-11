import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Sets the player's den privacy or asks for someone's
 * @class
 */
@Packet(Incoming.DenPrivacy, 'xt')
export class DenPrivacyIncoming extends IncomingPacket {
  /**
   * Whether it asks for someone's
   */
  @Field.bool() public readonly lookup: boolean = false

  /**
   * The setting or the den's owner
   */
  @Field.string() public readonly value: string = ''
}
