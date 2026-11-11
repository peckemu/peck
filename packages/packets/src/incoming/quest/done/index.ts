import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Finishes picking gifts
 * @class
 */
@Packet(Incoming.QuestGiftsDone, 'xt')
export class QuestGiftsDoneIncoming extends IncomingPacket {
  /**
   * Always 1
   */
  @Field.int() public readonly done: number = 0
}
