import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Redeems the den's eco credits
 * @class
 */
@Packet(Incoming.DenEcoRedeem, 'xt')
export class DenEcoRedeemIncoming extends IncomingPacket {}
