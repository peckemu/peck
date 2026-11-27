import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Joins a private adventure
 * @class
 */
@Packet(Incoming.QuestJoinPrivate, 'xt')
export class QuestJoinPrivateIncoming extends IncomingPacket {
  /**
   * The player's room
   */
  @Field.string() public readonly roomName: string = ''

  /**
   * The host's username
   */
  @Field.string() public readonly hostUserName: string = ''
}
