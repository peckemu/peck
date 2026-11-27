import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Plants a seed
 * @class
 */
@Packet(Incoming.QuestPlant, 'xt')
export class QuestPlantIncoming extends IncomingPacket {
  /**
   * The seed
   */
  @Field.int() public readonly defId: number = 0

  /**
   * Where across
   */
  @Field.int() public readonly x: number = 0

  /**
   * Where down
   */
  @Field.int() public readonly y: number = 0
}
