import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Buys another animal slot
 * @class
 */
@Packet(Incoming.AvatarSlot, 'xt')
export class AvatarSlotIncoming extends IncomingPacket {}
