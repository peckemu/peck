import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Finishes a room minigame
 * @class
 */
@Packet(Incoming.QuestRoomGame, 'xt')
export class QuestRoomGameIncoming extends IncomingPacket {
  /**
   * The adventure room
   */
  @Field.string() public readonly roomName: string = ''

  /**
   * How it came out
   */
  @Field.int() public readonly result: number = 0
}
