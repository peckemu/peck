import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for an avatar's items
 * @class
 */
@Packet(Incoming.ItemList, 'xt')
export class ItemListIncoming extends IncomingPacket {
  /**
   * Whose avatar
   */
  @Field.string() public readonly userName: string = ''

  /**
   * Which avatar
   */
  @Field.int() public readonly perUserAvId: number = 0

  /**
   * Whether to list everything
   */
  @Field.int() public readonly full: number = 0
}
