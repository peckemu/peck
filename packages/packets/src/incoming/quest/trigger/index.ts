import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Sets off an actor
 * @class
 */
@Packet(Incoming.QuestTrigger, 'xt')
export class QuestTriggerIncoming extends IncomingPacket {
  /**
   * The actor
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * Which way it was set off
   */
  @Field.int() public readonly value: number = 0
}
