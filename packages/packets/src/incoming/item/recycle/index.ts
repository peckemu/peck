import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Recycles clothing
 * @class
 */
@Packet(Incoming.ItemRecycle, 'xt')
export class ItemRecycleIncoming extends IncomingPacket {
  /**
   * The items' places in the inventory
   */
  @Field.rest(Field.int()) public readonly invIds: readonly number[] = []
}
