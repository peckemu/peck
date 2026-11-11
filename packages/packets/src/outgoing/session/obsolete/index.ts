import { OutgoingPacket, Packet } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The version was refused
 * @class
 */
@Packet(Outgoing.ApiObsolete, 'xml')
export class ApiObsoleteOutgoing extends OutgoingPacket {}
