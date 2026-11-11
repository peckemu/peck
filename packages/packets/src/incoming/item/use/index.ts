import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Puts clothing on and takes it off
 * @class
 */
@Packet(Incoming.ItemUse, 'xt')
export class ItemUseIncoming extends IncomingPacket {
  /**
   * How many to put on
   */
  @Field.int() public readonly wearCount: number = 0

  /**
   * How many to take off
   */
  @Field.int() public readonly removeCount: number = 0

  /**
   * The items
   */
  @Field.rest() public readonly invIds: readonly string[] = []
}
