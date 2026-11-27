import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Finishes an adventure's minigame
 * @class
 */
@Packet(Incoming.QuestMinigame, 'xt')
export class QuestMinigameIncoming extends IncomingPacket {
  /**
   * The actor that started it
   */
  @Field.string() public readonly actorName: string = ''

  /**
   * The state it carried
   */
  @Field.int() public readonly actorState: number = 0

  /**
   * How it came out
   */
  @Field.int() public readonly result: number = 0
}
