import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks how many buddies are in each land
 * @class
 */
@Packet(Incoming.RoomCount, 'xt')
export class RoomCountIncoming extends IncomingPacket {}
