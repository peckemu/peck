import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Leaves an actor's area
 * @class
 */
@Packet(Incoming.QuestUntrigger, 'xt')
export class QuestUntriggerIncoming extends IncomingPacket {
  /**
   * The actor
   */
  @Field.string() public readonly actorId: string = ''
}
