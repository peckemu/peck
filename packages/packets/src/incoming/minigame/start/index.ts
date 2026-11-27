import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Starts a waiting minigame now
 * @class
 */
@Packet(Incoming.MinigameStart, 'xt')
export class MinigameStartIncoming extends IncomingPacket {
  /**
   * The game
   */
  @Field.int() public readonly gameDefId: number = 0
}
