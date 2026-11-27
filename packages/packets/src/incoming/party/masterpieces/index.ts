import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks for the masterpieces
 * @class
 */
@Packet(Incoming.Masterpieces, 'xt')
export class MasterpiecesIncoming extends IncomingPacket {}
