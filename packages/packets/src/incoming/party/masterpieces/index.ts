import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for the masterpieces
 * @class
 */
@Packet(Incoming.Masterpieces, 'xt')
export class MasterpiecesIncoming extends IncomingPacket {}
