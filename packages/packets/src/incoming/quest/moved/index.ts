import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks where items were moved
 * @class
 */
@Packet(Incoming.QuestMovedItems, 'xt')
export class QuestMovedItemsIncoming extends IncomingPacket {}
