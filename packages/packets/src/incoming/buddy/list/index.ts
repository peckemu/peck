import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for the buddy and blocked lists
 * @class
 */
@Packet(Incoming.BuddyList, 'xt')
export class BuddyListIncoming extends IncomingPacket {}
