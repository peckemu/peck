import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for the login key
 * @class
 */
@Packet(Incoming.RandomKey, 'xml')
export class RandomKeyIncoming extends IncomingPacket {}
