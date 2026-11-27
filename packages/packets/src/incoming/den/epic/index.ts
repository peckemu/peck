import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks for the epic dens
 * @class
 */
@Packet(Incoming.DenEpic, 'xt')
export class DenEpicIncoming extends IncomingPacket {}
