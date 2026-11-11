import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Makes the player's first animal
 * @class
 */
@Packet(Incoming.AvatarFastPass, 'xt')
export class AvatarFastPassIncoming extends IncomingPacket {
  /**
   * The kind of animal
   */
  @Field.int() public readonly avTypeId: number = 0

  /**
   * The first part of its name
   */
  @Field.int() public readonly firstNameId: number = 0

  /**
   * The middle part of its name
   */
  @Field.int() public readonly middleNameId: number = 0

  /**
   * The last part of its name
   */
  @Field.int() public readonly lastNameId: number = 0
}
