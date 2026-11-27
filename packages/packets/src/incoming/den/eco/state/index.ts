import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../../headers/index.ts'

/**
 * Asks for the den's eco system
 * @class
 */
@Packet(Incoming.DenEcoState, 'xt')
export class DenEcoStateIncoming extends IncomingPacket {}
