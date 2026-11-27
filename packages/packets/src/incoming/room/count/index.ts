import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks how many buddies are in each land
 * @class
 */
@Packet(Incoming.RoomCount, 'xt')
export class RoomCountIncoming extends IncomingPacket {}
