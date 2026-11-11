import { OutgoingPacket, Packet } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The email was validated
 * @class
 */
@Packet(Outgoing.EmailValidated, 'xt')
export class EmailValidatedOutgoing extends OutgoingPacket {}
