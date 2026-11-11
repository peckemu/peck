import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Keeps or turns down a treasure
 * @class
 */
@Packet(Incoming.QuestTreasure, 'xt')
export class QuestTreasureIncoming extends IncomingPacket {
  /**
   * The treasure
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * Whether it is kept
   */
  @Field.int() public readonly keep: number = 0
}
