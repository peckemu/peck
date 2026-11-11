import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Donates gems
 * @class
 */
@Packet(Incoming.GemDonation, 'xt')
export class GemDonationIncoming extends IncomingPacket {
  /**
   * The gems
   */
  @Field.int() public readonly amount: number = 0
}
