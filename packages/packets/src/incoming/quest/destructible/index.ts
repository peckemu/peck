import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Says a phantom hit a destructible
 * @class
 */
@Packet(Incoming.QuestDestructible, 'xt')
export class QuestDestructibleIncoming extends IncomingPacket {
  /**
   * The phantom
   */
  @Field.string() public readonly phantomActorId: string = ''

  /**
   * The destructible
   */
  @Field.string() public readonly destructibleActorId: string = ''
}
