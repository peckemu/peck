import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * A keep alive
 * @class
 */
@Packet(Incoming.KeepAlive, 'xt')
export class KeepAliveIncoming extends IncomingPacket {}
