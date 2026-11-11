import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Leaves a minigame
 * @class
 */
@Packet(Incoming.MinigameLeave, 'xt')
export class MinigameLeaveIncoming extends IncomingPacket {}
