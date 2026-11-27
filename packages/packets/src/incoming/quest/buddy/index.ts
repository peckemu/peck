import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Joins a buddy's adventure
 * @class
 */
@Packet(Incoming.QuestJoinBuddy, 'xt')
export class QuestJoinBuddyIncoming extends IncomingPacket {
  /**
   * The player's room
   */
  @Field.string() public readonly roomName: string = ''

  /**
   * The buddy's username
   */
  @Field.string() public readonly buddyUserName: string = ''
}
