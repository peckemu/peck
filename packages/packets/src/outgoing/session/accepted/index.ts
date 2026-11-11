import { OutgoingPacket, Packet } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The version was accepted
 * @class
 */
@Packet(Outgoing.ApiOk, 'xml')
export class ApiOkOutgoing extends OutgoingPacket {}
