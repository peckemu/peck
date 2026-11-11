import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Chooses the pet to walk with
 * @class
 */
@Packet(Incoming.PetSwitch, 'xt')
export class PetSwitchIncoming extends IncomingPacket {
  /**
   * The pet, or 0
   */
  @Field.int() public readonly invId: number = 0
}
