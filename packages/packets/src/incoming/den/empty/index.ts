import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Empties the player's den
 * @class
 */
@Packet(Incoming.DenEmpty, 'xt')
export class DenEmptyIncoming extends IncomingPacket {}
