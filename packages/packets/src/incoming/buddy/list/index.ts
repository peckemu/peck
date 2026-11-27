import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks for the buddy and blocked lists
 * @class
 */
@Packet(Incoming.BuddyList, 'xt')
export class BuddyListIncoming extends IncomingPacket {}
