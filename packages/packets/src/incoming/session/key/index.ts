import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks for the login key
 * @class
 */
@Packet(Incoming.RandomKey, 'xml')
export class RandomKeyIncoming extends IncomingPacket {}
