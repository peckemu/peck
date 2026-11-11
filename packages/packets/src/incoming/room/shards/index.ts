import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for the shards
 * @class
 */
@Packet(Incoming.ShardList, 'xt')
export class ShardListIncoming extends IncomingPacket {}
