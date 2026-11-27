import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * An idle timeout
 * @class
 */
@Packet(Incoming.IdleTimeout, 'xt')
export class IdleTimeoutIncoming extends IncomingPacket {}
