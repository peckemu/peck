import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Sets a user variable
 * @class
 */
@Packet(Incoming.UserVariableSet, 'xt')
export class UserVariableSetIncoming extends IncomingPacket {
  /**
   * The variable's id
   */
  @Field.int() public readonly varId: number = 0

  /**
   * The value or bit
   */
  @Field.int() public readonly value: number = 0

  /**
   * Whether to set the bit
   */
  @Field.int() public readonly on: number = 1
}
