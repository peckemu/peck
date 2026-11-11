import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for an activation email
 * @class
 */
@Packet(Incoming.EmailActivation, 'xt')
export class EmailActivationIncoming extends IncomingPacket {
  /**
   * The activation email address
   */
  @Field.string() public readonly email: string = ''
}
