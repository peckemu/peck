import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Answers a buddy request
 * @class
 */
@Packet(Incoming.BuddyAnswer, 'xt')
export class BuddyAnswerIncoming extends IncomingPacket {
  /**
   * The asker
   */
  @Field.string() public readonly userName: string = ''

  /**
   * 1 to accept
   */
  @Field.int() public readonly accept: number = 0
}
