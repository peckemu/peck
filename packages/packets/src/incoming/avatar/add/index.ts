import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Adds another animal
 * @class
 */
@Packet(Incoming.AvatarAdd, 'xt')
export class AvatarAddIncoming extends IncomingPacket {
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

  /**
   * The kind of animal
   */
  @Field.int() public readonly avTypeId: number = 0

  /**
   * The custom animal, or -1
   */
  @Field.int() public readonly customAvId: number = -1

  /**
   * The diamond shop entry, or -1
   */
  @Field.int() public readonly diamondDefId: number = -1

  /**
   * The shop, or -1
   */
  @Field.int() public readonly shopId: number = -1
}
