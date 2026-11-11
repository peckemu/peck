import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Marks a newspaper page seen
 * @class
 */
@Packet(Incoming.NewspaperSeen, 'xt')
export class NewspaperSeenIncoming extends IncomingPacket {
  /**
   * The page's definition id
   */
  @Field.int() public readonly defId: number = 0
}
