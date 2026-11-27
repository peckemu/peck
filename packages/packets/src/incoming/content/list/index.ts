import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks for a generic list
 * @class
 */
@Packet(Incoming.GenericList, 'xt')
export class GenericListIncoming extends IncomingPacket {
  /**
   * The list id
   */
  @Field.int() public readonly listId: number = 0
}
