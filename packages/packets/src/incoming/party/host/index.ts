import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Hosts a party
 * @class
 */
@Packet(Incoming.PartyHost, 'xt')
export class PartyHostIncoming extends IncomingPacket {
  /**
   * The party
   */
  @Field.int() public readonly defId: number = 0

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
   * The song it plays
   */
  @Field.int() public readonly songDefId: number = 0
}
