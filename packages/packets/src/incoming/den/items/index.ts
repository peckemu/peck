import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks for the player's den items
 * @class
 */
@Packet(Incoming.DenItems, 'xt')
export class DenItemsIncoming extends IncomingPacket {}
