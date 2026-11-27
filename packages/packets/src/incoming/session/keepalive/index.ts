import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * A keep alive
 * @class
 */
@Packet(Incoming.KeepAlive, 'xt')
export class KeepAliveIncoming extends IncomingPacket {}
