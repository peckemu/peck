import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks an actor to seek
 * @class
 */
@Packet(Incoming.QuestSeek, 'xt')
export class QuestSeekIncoming extends IncomingPacket {
  /**
   * The actor
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * What it seeks
   */
  @Field.int() public readonly seekType: number = 0
}
