import { OutgoingPacket, Packet } from '@peck/protocol'

import { Outgoing } from '../../headers/index.ts'

/**
 * The version was refused
 * @class
 */
@Packet(Outgoing.ApiObsolete, 'xml')
export class ApiObsoleteOutgoing extends OutgoingPacket {}
