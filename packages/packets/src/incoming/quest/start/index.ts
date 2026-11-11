import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Starts an adventure
 * @class
 */
@Packet(Incoming.QuestStart, 'xt')
export class QuestStartIncoming extends IncomingPacket {
  /**
   * The lobby room
   */
  @Field.string() public readonly roomName: string = ''
}
