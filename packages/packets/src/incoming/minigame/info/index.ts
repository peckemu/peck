import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks about minigames
 * @class
 */
@Packet(Incoming.MinigameInfo, 'xt')
export class MinigameInfoIncoming extends IncomingPacket {
  /**
   * The games' definition ids
   */
  @Field.rest(Field.int()) public readonly gameDefIds: readonly number[] = []
}
