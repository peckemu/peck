import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Joins a den
 * @class
 */
@Packet(Incoming.DenJoin, 'xt')
export class DenJoinIncoming extends IncomingPacket {
  /**
   * den and the owner's username
   */
  @Field.string() public readonly denName: string = ''

  /**
   * Whether a foreign den was allowed
   */
  @Field.int() public readonly confirmLanguageChange: number = 0

  /**
   * The den door, or -1
   */
  @Field.int() public readonly doorItem: number = -1
}
