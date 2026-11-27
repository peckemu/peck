import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks for the referral code
 * @class
 */
@Packet(Incoming.ReferralCode, 'xt')
export class ReferralCodeIncoming extends IncomingPacket {}
