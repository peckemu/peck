import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Shows or hides the mastery badge
 * @class
 */
@Packet(Incoming.PetMastery, 'xt')
export class PetMasteryIncoming extends IncomingPacket {
  /**
   * 1 to show it
   */
  @Field.int() public readonly show: number = 0

  /**
   * The pet
   */
  @Field.int() public readonly invId: number = 0
}
