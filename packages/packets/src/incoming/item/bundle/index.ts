import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Buys a shop's whole bundle
 * @class
 */
@Packet(Incoming.DiamondBundle, 'xt')
export class DiamondBundleIncoming extends IncomingPacket {
  /**
   * The shop's list id
   */
  @Field.int() public readonly shopId: number = 0
}
