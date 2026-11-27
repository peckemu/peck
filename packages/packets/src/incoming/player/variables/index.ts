import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks for the player's user variables
 * @class
 */
@Packet(Incoming.UserVariables, 'xt')
export class UserVariablesIncoming extends IncomingPacket {}
