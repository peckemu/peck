import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Picks up an item
 * @class
 */
@Packet(Incoming.QuestPickUp, 'xt')
export class QuestPickUpIncoming extends IncomingPacket {
  /**
   * The item
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * The player's session id
   */
  @Field.int() public readonly userId: number = 0
}
