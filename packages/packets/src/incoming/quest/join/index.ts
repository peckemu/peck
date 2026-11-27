import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Joins or opens a public adventure
 * @class
 */
@Packet(Incoming.QuestJoin, 'xt')
export class QuestJoinIncoming extends IncomingPacket {
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

  /**
   * Always 0
   */
  @Field.int() public readonly reserved: number = 0
}
