import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Frees a pet
 * @class
 */
@Packet(Incoming.PetRelease, 'xt')
export class PetReleaseIncoming extends IncomingPacket {
  /**
   * The pet
   */
  @Field.int() public readonly invId: number = 0
}
