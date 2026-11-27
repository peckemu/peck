import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks to come back
 * @class
 */
@Packet(Incoming.QuestRespawn, 'xt')
export class QuestRespawnIncoming extends IncomingPacket {
  /**
   * Always 0
   */
  @Field.int() public readonly reserved: number = 0

  /**
   * Where across
   */
  @Field.int() public readonly x: number = 0

  /**
   * Where down
   */
  @Field.int() public readonly y: number = 0
}
