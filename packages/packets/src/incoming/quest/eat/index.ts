import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Says a plant bit a phantom
 * @class
 */
@Packet(Incoming.QuestEat, 'xt')
export class QuestEatIncoming extends IncomingPacket {
  /**
   * The plant
   */
  @Field.string() public readonly plantActorId: string = ''

  /**
   * The phantom
   */
  @Field.string() public readonly phantomActorId: string = ''

  /**
   * Where across
   */
  @Field.int() public readonly x: number = 0

  /**
   * Where down
   */
  @Field.int() public readonly y: number = 0
}
