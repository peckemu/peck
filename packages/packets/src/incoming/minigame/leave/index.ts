import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Leaves a minigame
 * @class
 */
@Packet(Incoming.MinigameLeave, 'xt')
export class MinigameLeaveIncoming extends IncomingPacket {}
