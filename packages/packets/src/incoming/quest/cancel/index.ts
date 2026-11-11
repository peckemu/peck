import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Leaves an adventure lobby
 * @class
 */
@Packet(Incoming.QuestCancel, 'xt')
export class QuestCancelIncoming extends IncomingPacket {}
