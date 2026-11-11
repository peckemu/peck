import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for the adventure again
 * @class
 */
@Packet(Incoming.QuestClone, 'xt')
export class QuestCloneIncoming extends IncomingPacket {}
