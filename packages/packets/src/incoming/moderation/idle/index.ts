import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * An idle timeout
 * @class
 */
@Packet(Incoming.IdleTimeout, 'xt')
export class IdleTimeoutIncoming extends IncomingPacket {}
