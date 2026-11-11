import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Opens a private adventure
 * @class
 */
@Packet(Incoming.QuestCreate, 'xt')
export class QuestCreateIncoming extends IncomingPacket {
  /**
   * The player's room
   */
  @Field.string() public readonly roomName: string = ''

  /**
   * The adventure
   */
  @Field.int() public readonly scriptDefId: number = 0

  /**
   * Normal 0 or hard 1
   */
  @Field.int() public readonly difficulty: number = 0
}
