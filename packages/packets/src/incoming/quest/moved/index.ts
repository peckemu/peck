import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks where items were moved
 * @class
 */
@Packet(Incoming.QuestMovedItems, 'xt')
export class QuestMovedItemsIncoming extends IncomingPacket {}
