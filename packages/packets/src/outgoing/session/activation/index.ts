import { Field, OutgoingPacket, Packet } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether the activation email was sent
 * @class
 */
@Packet(Outgoing.EmailActivation, 'xt')
export class EmailActivationOutgoing extends OutgoingPacket {
  /**
   * Whether the email was sent
   */
  @Field.bool() public readonly sent: boolean = false
}
