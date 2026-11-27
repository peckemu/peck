import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks for the live parties
 * @class
 */
@Packet(Incoming.PartyList, 'xt')
export class PartyListIncoming extends IncomingPacket {}
