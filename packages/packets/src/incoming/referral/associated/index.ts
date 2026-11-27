import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks whether the player has a referrer
 * @class
 */
@Packet(Incoming.ReferralAssociated, 'xt')
export class ReferralAssociatedIncoming extends IncomingPacket {}
