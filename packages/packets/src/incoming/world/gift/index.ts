import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Takes a world item's gift
 * @class
 */
@Packet(Incoming.WorldItemGift, 'xt')
export class WorldItemGiftIncoming extends IncomingPacket {
  /**
   * The world item's definition id
   */
  @Field.int() public readonly defId: number = 0

  /**
   * The den item's version
   */
  @Field.int() public readonly version: number = 0

  /**
   * The clothing colour index
   */
  @Field.int() public readonly colorIndex: number = 0
}
