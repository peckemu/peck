import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Says a plant started eating
 * @class
 */
@Packet(Incoming.QuestPlantAte, 'xt')
export class QuestPlantAteIncoming extends IncomingPacket {
  /**
   * The plant
   */
  @Field.string() public readonly plantActorId: string = ''

  /**
   * The phantom, or empty
   */
  @Field.string() public readonly phantomActorId: string = ''
}
