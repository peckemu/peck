import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Kicks a player from a private lobby
 * @class
 */
@Packet(Incoming.QuestKick, 'xt')
export class QuestKickIncoming extends IncomingPacket {
  /**
   * The player's username
   */
  @Field.string() public readonly userName: string = ''
}
