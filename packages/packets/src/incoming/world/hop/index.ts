import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks for another node
 * @class
 */
@Packet(Incoming.NodeHop, 'xt')
export class NodeHopIncoming extends IncomingPacket {}
