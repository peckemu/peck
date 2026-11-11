import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Adopts a pet
 * @class
 */
@Packet(Incoming.PetCreate, 'xt')
export class PetCreateIncoming extends IncomingPacket {
  /**
   * The shop's list id
   */
  @Field.int() public readonly shopId: number = 0

  /**
   * Its look
   */
  @Field.int() public readonly lBits: number = 0

  /**
   * More traits
   */
  @Field.int() public readonly uBits: number = 0

  /**
   * Unused look bits
   */
  @Field.uint() public readonly eBits: number = 0

  /**
   * The first part of its name
   */
  @Field.int() public readonly firstNameId: number = 0

  /**
   * The second part of its name
   */
  @Field.int() public readonly secondNameId: number = 0

  /**
   * Whether it is from a redemption card
   */
  @Field.int() public readonly fromRedemption: number = 0
}
