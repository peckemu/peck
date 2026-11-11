import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Names a hatched egg
 * @class
 */
@Packet(Incoming.PetName, 'xt')
export class PetNameIncoming extends IncomingPacket {
  /**
   * The pet
   */
  @Field.int() public readonly invId: number = 0

  /**
   * The first part of its name
   */
  @Field.int() public readonly firstNameId: number = 0

  /**
   * The second part of its name
   */
  @Field.int() public readonly secondNameId: number = 0
}
