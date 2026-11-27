import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Says a beam caught the player
 * @class
 */
@Packet(Incoming.QuestBeamZap, 'xt')
export class QuestBeamZapIncoming extends IncomingPacket {
  /**
   * The beam
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * The player's session id
   */
  @Field.int() public readonly userId: number = 0
}
