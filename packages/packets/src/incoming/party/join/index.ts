import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Goes to a party
 * @class
 */
@Packet(Incoming.PartyJoin, 'xt')
export class PartyJoinIncoming extends IncomingPacket {
  /**
   * The party
   */
  @Field.int() public readonly defId: number = 0
}
