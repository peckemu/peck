import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Recycles den items or den rooms
 * @class
 */
@Packet(Incoming.DenRecycle, 'xt')
export class DenRecycleIncoming extends IncomingPacket {
  /**
   * 0 den items, -1 den rooms
   */
  @Field.int() public readonly kind: number = 0

  /**
   * Their places
   */
  @Field.string() public readonly invIdxs: string = ''
}
