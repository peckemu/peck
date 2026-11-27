import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks for the player's den rooms
 * @class
 */
@Packet(Incoming.DenRooms, 'xt')
export class DenRoomsIncoming extends IncomingPacket {}
