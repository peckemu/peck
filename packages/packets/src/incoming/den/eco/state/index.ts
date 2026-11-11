import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for the den's eco system
 * @class
 */
@Packet(Incoming.DenEcoState, 'xt')
export class DenEcoStateIncoming extends IncomingPacket {}
