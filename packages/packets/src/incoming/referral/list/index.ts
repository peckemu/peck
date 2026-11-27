import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks for a page of the player's referrals
 * @class
 */
@Packet(Incoming.ReferralList, 'xt')
export class ReferralListIncoming extends IncomingPacket {
  /**
   * The page, from 1
   */
  @Field.int() public readonly page: number = 0

  /**
   * How many make a page
   */
  @Field.int() public readonly size: number = 0
}
