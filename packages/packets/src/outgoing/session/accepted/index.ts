import { OutgoingPacket, Packet } from '@peck/protocol'

import { Outgoing } from '../../headers/index.ts'

/**
 * The version was accepted
 * @class
 */
@Packet(Outgoing.ApiOk, 'xml')
export class ApiOkOutgoing extends OutgoingPacket {}
