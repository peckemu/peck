import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for the first five minutes room
 * @class
 */
@Packet(Incoming.FirstFiveMinutes, 'xt')
export class FirstFiveMinutesIncoming extends IncomingPacket {}
