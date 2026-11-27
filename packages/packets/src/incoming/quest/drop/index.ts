import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Drops an item
 * @class
 */
@Packet(Incoming.QuestDrop, 'xt')
export class QuestDropIncoming extends IncomingPacket {
  /**
   * Where across
   */
  @Field.int() public readonly x: number = 0

  /**
   * Where down
   */
  @Field.int() public readonly y: number = 0

  /**
   * The item
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * The player's session id
   */
  @Field.int() public readonly userId: number = 0
}
