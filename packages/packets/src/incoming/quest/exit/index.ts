import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Leaves an adventure
 * @class
 */
@Packet(Incoming.QuestExit, 'xt')
export class QuestExitIncoming extends IncomingPacket {
  /**
   * How the player leaves
   */
  @Field.string() public readonly exitType: string = ''
}
