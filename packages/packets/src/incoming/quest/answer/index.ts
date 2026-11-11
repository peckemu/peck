import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Answers an adventure's question
 * @class
 */
@Packet(Incoming.QuestAnswer, 'xt')
export class QuestAnswerIncoming extends IncomingPacket {
  /**
   * The actor that asked
   */
  @Field.string() public readonly actorName: string = ''

  /**
   * The state asked about
   */
  @Field.int() public readonly actorState: number = 0

  /**
   * Whether the answer is yes
   */
  @Field.int() public readonly yes: number = 0
}
