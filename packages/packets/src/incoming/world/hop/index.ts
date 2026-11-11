import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for another node
 * @class
 */
@Packet(Incoming.NodeHop, 'xt')
export class NodeHopIncoming extends IncomingPacket {}
