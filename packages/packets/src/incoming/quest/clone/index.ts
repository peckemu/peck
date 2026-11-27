import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks for the adventure again
 * @class
 */
@Packet(Incoming.QuestClone, 'xt')
export class QuestCloneIncoming extends IncomingPacket {}
