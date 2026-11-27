import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Buys another animal slot
 * @class
 */
@Packet(Incoming.AvatarSlot, 'xt')
export class AvatarSlotIncoming extends IncomingPacket {}
