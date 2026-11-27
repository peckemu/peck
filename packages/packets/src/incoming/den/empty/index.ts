import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Empties the player's den
 * @class
 */
@Packet(Incoming.DenEmpty, 'xt')
export class DenEmptyIncoming extends IncomingPacket {}
